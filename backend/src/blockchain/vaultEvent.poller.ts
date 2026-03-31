import { indexSecureVaultEvents } from "./vaultEvents.indexer.js";
import { IIndexerStateRepository } from "./indexerState.interface.js";
import { IBlockChainClient } from "./blockchain.interface.js";
import { IVaultWriter } from "@modules/vault/vault.interface.js";

const INDEXER_ID = "secureVault";
const POLL_INTERVAL = 5000;
const MAX_BLOCK_RANGE = 9n;
export class VaultEventPoller {
    constructor(
        private indexerState: IIndexerStateRepository,
        private blockchainClient: IBlockChainClient,
        private vaultWriter: IVaultWriter,
        private vaultAddress: `0x${string}`,
        private deploymentBlock: bigint
    ) {}

    private isIndexing = false;
    private lastIndexerError: string | null = null;

    async start(): Promise<void> {
        await this.syncOnce();

        const poll = async () => {
            await this.syncOnce();
            setTimeout(poll, POLL_INTERVAL);
        };

        setTimeout(poll, POLL_INTERVAL);
    }

    getHealth() {
        return {
            isIndexing: this.isIndexing,
            lastIndexerError: this.lastIndexerError,
        };
    }

    private async syncOnce(): Promise<void> {
        if (this.isIndexing) {
            console.log("Previous indexing still running, skipping...");
            return;
        }

        try {
            this.isIndexing = true;

            const state = await this.indexerState.getState(INDEXER_ID);
            let lastIndexedBlock = state?.lastBlock ?? this.deploymentBlock;

            const latestBlock = await this.blockchainClient.getBlockNumber();

            if (latestBlock <= lastIndexedBlock) {
                console.log("No new blocks to index.");
                return;
            }

            while (lastIndexedBlock < latestBlock) {
                const fromBlock = lastIndexedBlock + 1n;
                const toBlock =
                    fromBlock + MAX_BLOCK_RANGE > latestBlock
                        ? latestBlock
                        : fromBlock + MAX_BLOCK_RANGE;

                console.log(`Indexing blocks ${fromBlock} → ${toBlock}`);

                await indexSecureVaultEvents(
                    fromBlock,
                    toBlock,
                    this.blockchainClient,
                    this.vaultWriter,
                    this.vaultAddress
                );

                await this.indexerState.setState(INDEXER_ID, toBlock);
                lastIndexedBlock = toBlock;
            }

            this.lastIndexerError = null; // clear error on successful sync
            console.log("Sync complete.");
        } catch (error) {
            this.lastIndexerError =
                error instanceof Error ? error.message : "Unknown error";
            console.error("Indexer error:", error);
        } finally {
            this.isIndexing = false;
        }
    }
}
