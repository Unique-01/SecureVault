import { generateNonce } from "@utils/nonce.js";
import {
    INonceRepository,
    INonceService,
    NonceRecord,
} from "./nonce.interface.js";
import {
    NonceIsExpiredError,
    NonceNotFoundError,
} from "./errors/NonceErrors.js";

class NonceService implements INonceService {
    constructor(private nonceRepo: INonceRepository) {}

    async generateNonce(walletAddress: string): Promise<NonceRecord> {
        const nonce = generateNonce();
        const expiresAt = new Date(Date.now() + 5 * 60_000);

        return await this.nonceRepo.createNonce(
            walletAddress,
            nonce,
            expiresAt
        );
    }

    async getValidNonce(walletAddress: string): Promise<NonceRecord> {
        const nonce = await this.nonceRepo.retrieveNonce(walletAddress);
        const now = new Date(Date.now());

        if (!nonce) {
            throw new NonceNotFoundError();
        }
        if (nonce.expiresAt < now) {
            throw new NonceIsExpiredError();
        }

        return nonce;
    }

    async deleteNonce(walletAddress: string): Promise<void> {
        return await this.nonceRepo.deleteNonce(walletAddress);
    }
}

export default NonceService;
