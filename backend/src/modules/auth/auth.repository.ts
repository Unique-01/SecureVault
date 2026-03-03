import { prisma } from "@prisma/client.js";
import { IAuthRepository } from "./auth.interface.js";

export const authRepository: IAuthRepository = {
    async upsertNonce(wallet: string, nonce: string, expiresAt: Date) {
        return await prisma.authNonce.upsert({
            where: { walletAddress: wallet },
            update: { nonce, expiresAt },
            create: {
                walletAddress: wallet,
                nonce,
                expiresAt,
            },
        });
    },

    async findNonce(wallet: string) {
        return await prisma.authNonce.findUnique({
            where: { walletAddress: wallet },
        });
    },

    async findUser(wallet: string) {
        return await prisma.user.findUnique({
            where: { walletAddress: wallet },
        });
    },

    async createUser(wallet: string) {
        return await prisma.user.create({
            data: { walletAddress: wallet },
        });
    },

    async updateUserLastLogin(wallet: string) {
        return await prisma.user.update({
            where: { walletAddress: wallet },
            data: { lastLoginAt: new Date() },
        });
    },

    async deleteNonce(wallet: string) {
        return await prisma.authNonce.delete({
            where: { walletAddress: wallet },
        });
    },
};
