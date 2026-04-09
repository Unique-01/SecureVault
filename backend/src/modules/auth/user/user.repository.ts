import { PrismaClient } from "src/generated/prisma/client.js";
import { IUserService, UserRecord } from "./user.interface.js";

class UserRepository implements IUserService {
    constructor(private db: PrismaClient) {}

    private normalize(wallet: string): string {
        return wallet.toLowerCase();
    }
    async identifyUser(walletAddress: string): Promise<UserRecord> {
        const normalizedWallet = this.normalize(walletAddress);
        return await this.db.user.upsert({
            where: { walletAddress: normalizedWallet },
            update: { lastLoginAt: new Date() },
            create: {
                walletAddress: normalizedWallet,
                lastLoginAt: new Date(),
            },
        });
    }
}

export default UserRepository;
