import { prisma } from "../prisma/client.js";
import { publicClient } from "./client.js";
import { indexSecureVaultEvents } from "./indexSecureVaultEvents.js";

const INDEXER_ID = "secureVault";
const DEPLOYMENT_BLOCK = BigInt(process.env.DEPLOYMENT_BLOCK!);
const POLL_INTERVAL = 5000; // 5 seconds

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

        const lastIndexedBlock = state?.lastBlock ?? DEPLOYMENT_BLOCK;

        const latestBlock = await publicClient.getBlockNumber();

        if (latestBlock <= lastIndexedBlock) {
            console.log("No new blocks to index.");
            return;
        }

        const fromBlock = lastIndexedBlock + 1n;
        const toBlock = latestBlock;

        console.log(`Indexing blocks ${fromBlock} → ${toBlock}`);

        await indexSecureVaultEvents(fromBlock);

        await prisma.indexerState.upsert({
            where: { id: INDEXER_ID },
            update: { lastBlock: toBlock },
            create: {
                id: INDEXER_ID,
                lastBlock: toBlock,
            },
        });

        console.log(`Synced up to block ${toBlock}`);
    } catch (error) {
        console.error("Indexer error:", error);
    } finally {
        isIndexing = false;
    }
}
