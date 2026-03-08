import {
    IIndexerStateRepository,
    IndexerState,
} from "./indexerState.interface.js";
import { PrismaClient } from "src/generated/prisma/client.js";

export class IndexerStateRepository implements IIndexerStateRepository {
    constructor(private db: PrismaClient) {}

    async getState(id: string): Promise<IndexerState | null> {
        return this.db.indexerState.findUnique({
            where: { id: id },
        });
    }

    async setState(id: string, lastBlock: bigint): Promise<void> {
        await this.db.indexerState.upsert({
            where: { id: id },
            update: { lastBlock: lastBlock },
            create: {
                id: id,
                lastBlock: lastBlock,
            },
        });
    }
}
