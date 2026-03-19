import { indexSecureVaultEvents } from "./vaultEvents.indexer.js";
import { IIndexerStateRepository } from "./indexerState.interface.js";
import { IBlockChainClient } from "./blockchain.interface.js";
import { IVaultWriter } from "@modules/vault/vault.interface.js";

const INDEXER_ID = "secureVault";
const POLL_INTERVAL = 5000;
const MAX_BLOCK_RANGE = 9n;

let isIndexing = false;
let lastIndexerError: string | null = null; // track last error for health endpoint

export function getIndexerHealth() {
    return { isIndexing, lastIndexerError };
}

export async function startPollingIndexer(
    indexerState: IIndexerStateRepository,
    blockchainClient: IBlockChainClient,
    vaultWriter: IVaultWriter,
    vaultAddress: `0x${string}`,
    deploymentBlock: bigint
) {
    console.log("Starting SecureVault polling indexer...");

    // Initial backfill
    await syncOnce(indexerState, blockchainClient, vaultWriter, vaultAddress, deploymentBlock);

    // Recursive polling — waits for sync to finish before scheduling next run
    const poll = async () => {
        await syncOnce(indexerState, blockchainClient, vaultWriter, vaultAddress, deploymentBlock);
        setTimeout(poll, POLL_INTERVAL);
    };

    setTimeout(poll, POLL_INTERVAL);
}

async function syncOnce(
    indexerState: IIndexerStateRepository,
    blockchainClient: IBlockChainClient,
    vaultWriter: IVaultWriter,
    vaultAddress: `0x${string}`,
    deploymentBlock: bigint
) {
    if (isIndexing) {
        console.log("Previous indexing still running, skipping...");
        return;
    }

    try {
        isIndexing = true;

        const state = await indexerState.getState(INDEXER_ID);
        let lastIndexedBlock = state?.lastBlock ?? deploymentBlock;

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
                vaultWriter,
                vaultAddress
            );

            await indexerState.setState(INDEXER_ID, toBlock);
            lastIndexedBlock = toBlock;
        }

        lastIndexerError = null; // clear error on successful sync
        console.log("Sync complete.");
    } catch (error) {
        lastIndexerError = error instanceof Error ? error.message : "Unknown error";
        console.error("Indexer error:", error);
    } finally {
        isIndexing = false;
    }
}