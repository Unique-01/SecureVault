import { prisma } from "../prisma/client.js";
import { publicClient } from "./client.js";
import { indexSecureVaultEvents } from "./indexSecureVaultEvents.js";

const INDEXER_ID = "secureVault";
const DEPLOYMENT_BLOCK = BigInt(process.env.DEPLOYMENT_BLOCK!);
const POLL_INTERVAL = 5000; // 5 seconds
const MAX_BLOCK_RANGE = 9n;

let isIndexing = false;

export async function startPollingIndexer() {
    console.log("Starting SecureVault polling indexer...");

    // Initial backfill
    await syncOnce();

    // Polling loop
    setInterval(async () => {
        if (isIndexing) {
            console.log("Previous indexing still running, skipping...");
            return;
        }

        await syncOnce();
    }, POLL_INTERVAL);
}

async function syncOnce() {
    try {
        isIndexing = true;

        const state = await prisma.indexerState.findUnique({
            where: { id: INDEXER_ID },
        });

        let lastIndexedBlock = state?.lastBlock ?? DEPLOYMENT_BLOCK;

        const latestBlock = await publicClient.getBlockNumber();

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

            await indexSecureVaultEvents(fromBlock, toBlock);

            await prisma.indexerState.upsert({
                where: { id: INDEXER_ID },
                update: { lastBlock: toBlock },
                create: {
                    id: INDEXER_ID,
                    lastBlock: toBlock,
                },
            });

            lastIndexedBlock = toBlock;
        }

        console.log(`Sync complete.`);
        // const toBlock = latestBlock;
    } catch (error) {
        console.error("Indexer error:", error);
    } finally {
        isIndexing = false;
    }
}
