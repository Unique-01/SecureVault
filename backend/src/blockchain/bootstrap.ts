import { VaultRepository } from "@modules/vault/vault.repository.js";
import { VaultEventPoller } from "./vaultEvent.poller.js";
import { IndexerStateRepository } from "./indexerState.repository.js";
import { publicClient } from "./client.js";
import { prisma } from "@prisma/client.js";

const VAULT_ADDRESS = process.env.VAULT_ADDRESS as `0x${string}`;

if (!VAULT_ADDRESS) {
    throw new Error("VAULT_ADDRESS is not defined in environment variables");
}
const DEPLOYMENT_BLOCK = BigInt(process.env.DEPLOYMENT_BLOCK!);

// bootstrap.ts
export const poller = (() => {
    const vaultWriter = new VaultRepository(prisma);
    const indexerStateRepo = new IndexerStateRepository(prisma);

    return new VaultEventPoller(
        indexerStateRepo,
        publicClient,
        vaultWriter,
        VAULT_ADDRESS,
        DEPLOYMENT_BLOCK
    );
})();

export const startIndexer = () => poller.start();
