import { PrismaClient } from "src/generated/prisma/client.js";
import { INonceRepository, NonceRecord } from "./nonce.interface.js";

class PrismaNonceRepository implements INonceRepository {
    constructor(private db: PrismaClient) {}

    private normalize(wallet: string): string {
        return wallet.toLowerCase();
    }

    async createNonce(
        walletAddress: string,
        nonce: string,
        expiresAt: Date
    ): Promise<NonceRecord> {
        const normalizedWallet = this.normalize(walletAddress);

        return await this.db.authNonce.upsert({
            where: { walletAddress: normalizedWallet },
            update: { nonce, expiresAt },
            create: {
                walletAddress: normalizedWallet,
                nonce,
                expiresAt,
            },
        });
    }

    async retrieveNonce(walletAddress: string): Promise<NonceRecord | null> {
        const normalizedWallet = this.normalize(walletAddress);

        return await this.db.authNonce.findUnique({
            where: { walletAddress: normalizedWallet },
        });
    }

    async deleteNonce(walletAddress: string): Promise<void> {
        const normalizedWallet = this.normalize(walletAddress);

        await this.db.authNonce.delete({
            where: { walletAddress: normalizedWallet },
        });
    }
}

export default PrismaNonceRepository;
