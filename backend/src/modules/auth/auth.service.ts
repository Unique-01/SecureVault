import { createLoginMessage } from "@utils/message.js";
import { INonceVerifier, INonceWriter } from "./nonce/nonce.interface.js";
import { ISignatureService, Hex } from "./signature/signature.interface.js";
import { IUserService } from "./user/user.interface.js";
import { ITokenService } from "src/common/token/token.interface.js";

class AuthService {
    constructor(
        private nonceWriter: INonceWriter,
        private nonceVerifier: INonceVerifier,
        private signatureService: ISignatureService,
        private userService: IUserService,
        private tokenService: ITokenService
    ) {}

    async getNonceMessage(walletAddress: string): Promise<string> {
        const normalizedWallet = walletAddress.toLowerCase();

        // const nonce = this.generateNonce();

        // const expiresAt = new Date(now.getTime() + 5 * 60_000);

        // await this.writer.upsertNonce(normalizedWallet, nonce, expiresAt);

        const nonceRecord = await this.nonceWriter.generateNonce(
            normalizedWallet
        );

        return createLoginMessage(
            normalizedWallet,
            nonceRecord.nonce,
            nonceRecord.expiresAt.toISOString()
        );
    }

    async verifySignature(
        walletAddress: string,
        signature: Hex
    ): Promise<{ token: string }> {
        const normalizedWallet = walletAddress.toLowerCase();

        // const authNonce = await this.verifier.findNonce(normalizedWallet);

        // if (!authNonce) {
        //     throw new Error("Nonce not found. Request a new one");
        // }

        // if (authNonce.expiresAt < now) {
        //     throw new Error("Nonce is expired. Request a new one");
        // }

        const nonceRecord = await this.nonceVerifier.findAndValidateNonce(
            normalizedWallet
        );

        const message = createLoginMessage(
            normalizedWallet,
            nonceRecord.nonce,
            nonceRecord.expiresAt.toISOString()
        );

        // const recoveredWallet = await this.recoverMessageAddress({
        //     message,
        //     signature: signature as Hex,
        // });

        // if (recoveredWallet.toLowerCase() !== normalizedWallet) {
        //     throw new Error("Invalid signature.");
        // }

        await this.signatureService.confirmWalletSignature(
            message,
            signature,
            normalizedWallet
        );

        let user = await this.userService.getUser(normalizedWallet);

        if (!user) {
            user = await this.userService.createUser(normalizedWallet);
        }

        await this.userService.updateUserLastLogin(normalizedWallet);

        const token = await this.tokenService.sign({
            walletAddress: normalizedWallet,
            userId: user.id,
        });

        await this.nonceVerifier.deleteNonce(normalizedWallet);

        return { token };
    }
}

export default AuthService;
