import { indexSecureVaultEvents } from "./vaultEvents.indexer.js";
import { IIndexerStateRepository } from "./indexerState.interface.js";
import { IBlockChainClient } from "./blockchain.interface.js";
import { IVaultWriter } from "@modules/vault/vault.interface.js";

const INDEXER_ID = "secureVault";
const DEPLOYMENT_BLOCK = BigInt(process.env.DEPLOYMENT_BLOCK!);
const POLL_INTERVAL = 5000; // 5 seconds
const MAX_BLOCK_RANGE = 9n;

let isIndexing = false;

export async function startPollingIndexer(
    indexerState: IIndexerStateRepository,
    blockchainClient: IBlockChainClient,
    vaultWriter: IVaultWriter
) {
    console.log("Starting SecureVault polling indexer...");

    // Initial backfill
    await syncOnce(indexerState, blockchainClient, vaultWriter);

    // Polling loop
    setInterval(async () => {
        if (isIndexing) {
            console.log("Previous indexing still running, skipping...");
            return;
        }

        await syncOnce(indexerState, blockchainClient, vaultWriter);
    }, POLL_INTERVAL);
}

async function syncOnce(
    indexerState: IIndexerStateRepository,
    blockchainClient: IBlockChainClient,
    vaultWriter: IVaultWriter
) {
    try {
        isIndexing = true;

        const state = await indexerState.getState(INDEXER_ID);
        let lastIndexedBlock = state?.lastBlock ?? DEPLOYMENT_BLOCK;

        const latestBlock = await blockchainClient.getBlockNumber();

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
                blockchainClient,
                vaultWriter
            );

            await indexerState.setState(INDEXER_ID, toBlock);

            lastIndexedBlock = toBlock;
        }

        console.log(`Sync complete.`);
    } catch (error) {
        console.error("Indexer error:", error);
    } finally {
        isIndexing = false;
    }
}
