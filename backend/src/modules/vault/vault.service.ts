import { prisma } from "@prisma/client.js";

export const getVaultHistory = (walletAddress: string) => {
    return prisma.vaultEvent.findMany({
        where: { walletAddress },
        orderBy: { timestamp: "desc" },
    });
};

export const getDeposits = (walletAddress: string) => {
    return prisma.vaultEvent.findMany({
        where: { walletAddress, eventType: "DEPOSIT" },
        orderBy: { timestamp: "desc" },
    });
};

export const getWithdrawal = (walletAddress: string) => {
    return prisma.vaultEvent.findMany({
        where: { walletAddress, eventType: "WITHDRAWAL" },
        orderBy: { timestamp: "desc" },
    });
};
