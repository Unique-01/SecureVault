import { IVaultReader, IVaultWriter } from "./vault.interface.js";
import type {
    VaultEventInput,
    VaultEventRecord,
} from "src/types/vaultEvent.types.js";
import Decimal from "decimal.js";
import { PrismaClient } from "src/generated/prisma/client.js";

export class VaultRepository implements IVaultReader, IVaultWriter {
    constructor(private db: PrismaClient) {}

    async getEventsByWallet(
        wallet: string,
        eventType?: "DEPOSIT" | "WITHDRAWAL"
    ): Promise<VaultEventRecord[]> {
        const events = await this.db.vaultEvent.findMany({
            where: {
                walletAddress: wallet,
                ...(eventType ? { eventType: eventType } : {}),
            },
            orderBy: { timestamp: "desc" },
        });

        return events.map((event) => ({
            ...event,
            amount: event.amount ? new Decimal(event.amount.toString()) : null,
        }));
    }

    async saveVaultEvent(event: VaultEventInput): Promise<void> {
        await this.db.vaultEvent.upsert({
            where: { txHash: event.txHash },
            update: {},
            create: {
                walletAddress: event.walletAddress,
                txHash: event.txHash,
                blockNumber: event.blockNumber,
                timestamp: event.timestamp,
                eventType: event.eventType,
                amount: event.amount,
            },
        });
    }
}
