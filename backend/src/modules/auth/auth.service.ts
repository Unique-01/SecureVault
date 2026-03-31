import { createLoginMessage } from "@utils/message.js";
import {
    INonceWriter,
    ISignatureVerifier,
    NonceGenerator,
    AddressRecoverer,
    JwtSigner,
    Hex,
} from "./auth.interface.js";

class AuthService {
    constructor(
        private writer: INonceWriter,
        private verifier: ISignatureVerifier,
        private generateNonce: NonceGenerator,
        private recoverMessageAddress: AddressRecoverer,
        private signJwt: JwtSigner
    ) {}

    async getNonceMessage(
        walletAddress: string,
        now: Date = new Date()
    ): Promise<string> {
        const normalizedWallet = walletAddress.toLowerCase();

        const nonce = this.generateNonce();

        const expiresAt = new Date(now.getTime() + 5 * 60_000);

        await this.writer.upsertNonce(normalizedWallet, nonce, expiresAt);

        return createLoginMessage(
            normalizedWallet,
            nonce,
            expiresAt.toISOString()
        );
    }

    async verifySignature(
        walletAddress: string,
        signature: string,
        now: Date = new Date()
    ): Promise<{ token: string }> {
        const normalizedWallet = walletAddress.toLowerCase();

        const authNonce = await this.verifier.findNonce(normalizedWallet);

        if (!authNonce) {
            throw new Error("Nonce not found. Request a new one");
        }

        if (authNonce.expiresAt < now) {
            throw new Error("Nonce is expired. Request a new one");
        }

        const message = createLoginMessage(
            normalizedWallet,
            authNonce.nonce,
            authNonce.expiresAt.toISOString()
        );

        const recoveredWallet = await this.recoverMessageAddress({
            message,
            signature: signature as Hex,
        });

        if (recoveredWallet.toLowerCase() !== normalizedWallet) {
            throw new Error("Invalid signature.");
        }

        let user = await this.verifier.findUser(normalizedWallet);

        if (!user) {
            user = await this.verifier.createUser(normalizedWallet);
        }

        await this.verifier.updateUserLastLogin(normalizedWallet);

        const token = this.signJwt({
            walletAddress: normalizedWallet,
            userId: user.id,
        });

        await this.verifier.deleteNonce(normalizedWallet);

        return { token };
    }
}

export default AuthService;
