import { prisma } from "@prisma/client.js";
import { IVaultRepository, VaultEventRecord } from "./vault.interface.js";
import Decimal from "decimal.js";

export const vaultRepository: IVaultRepository = {
    async getEventsByWallet(wallet, type): Promise<VaultEventRecord[]> {
        const events = await prisma.vaultEvent.findMany({
            where: {
                walletAddress: wallet,
                ...(type ? { eventType: type } : {}),
            },
            orderBy: { timestamp: "desc" },
        });

        return events.map((event) => ({
            ...event,
            amount: event.amount ? new Decimal(event.amount.toString()) : null,
        }));
    },
};
