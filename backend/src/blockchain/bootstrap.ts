import { VaultRepository } from "@modules/vault/vault.repository.js";
import { startPollingIndexer } from "./vaultEvent.poller.js";
import { IndexerStateRepository } from "./indexerState.repository.js";
import { publicClient } from "./client.js";
import { prisma } from "@prisma/client.js";

export const startIndexer = () => {
    const vaultWriter = new VaultRepository(prisma);
    const indexerStateRepo = new IndexerStateRepository(prisma);

    return startPollingIndexer(indexerStateRepo, publicClient, vaultWriter);
};
