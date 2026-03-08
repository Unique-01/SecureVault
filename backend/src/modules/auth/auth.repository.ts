import { IAuthRepository } from "./auth.interface.js";
import { PrismaClient } from "src/generated/prisma/client.js";

export class AuthRepository implements IAuthRepository {
    constructor(private db: PrismaClient) {}

    async upsertNonce(wallet: string, nonce: string, expiresAt: Date) {
        return await this.db.authNonce.upsert({
            where: { walletAddress: wallet },
            update: { nonce, expiresAt },
            create: {
                walletAddress: wallet,
                nonce,
                expiresAt,
            },
        });
    }

    async findNonce(wallet: string) {
        return await this.db.authNonce.findUnique({
            where: { walletAddress: wallet },
        });
    }

    async findUser(wallet: string) {
        return await this.db.user.findUnique({
            where: { walletAddress: wallet },
        });
    }

    async createUser(wallet: string) {
        return await this.db.user.create({
            data: { walletAddress: wallet },
        });
    }

    async updateUserLastLogin(wallet: string) {
        return await this.db.user.update({
            where: { walletAddress: wallet },
            data: { lastLoginAt: new Date() },
        });
    }

    async deleteNonce(wallet: string) {
        return await this.db.authNonce.delete({
            where: { walletAddress: wallet },
        });
    }
}
