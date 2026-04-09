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
        eventType?: string
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

    async getPendingWithdrawal(
        wallet: string
    ): Promise<VaultEventRecord | null> {
        const lastEvent = await this.db.vaultEvent.findFirst({
            where: {
                walletAddress: wallet,
                eventType: {
                    in: [
                        "WITHDRAWAL_REQUESTED",
                        "WITHDRAWAL_MODIFIED",
                        "WITHDRAWAL_CANCELLED",
                        "WITHDRAWAL_CLAIMED",
                    ],
                },
            },
            orderBy: { timestamp: "desc" },
        });

        if (
            !lastEvent ||
            ["WITHDRAWAL_CANCELLED", "WITHDRAWAL_CLAIMED"].includes(
                lastEvent.eventType
            )
        )
            return null;

        return {
            ...lastEvent,
            amount: lastEvent.amount
                ? new Decimal(lastEvent.amount.toString())
                : null,
        };
    }
    async getTotalVolume(wallet: string): Promise<string> {
        const aggregate = await this.db.vaultEvent.aggregate({
            _sum: {
                amount: true,
            },
            where: {
                walletAddress: wallet,
                eventType: { in: ["DEPOSIT", "WITHDRAW_EXECUTED"] },
            },
        });

        return new Decimal(aggregate._sum.amount?.toString() || "0").toFixed(2);
    }
}
