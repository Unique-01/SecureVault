import { createLoginMessage } from "@utils/message.js";
import { INonceService } from "./nonce/nonce.interface.js";
import { ISignatureService, Hex } from "./signature/signature.interface.js";
import { IUserService } from "./user/user.interface.js";
import { ITokenService } from "src/common/token/token.interface.js";

class AuthService {
    constructor(
        private nonceService: INonceService,
        private signatureService: ISignatureService,
        private userService: IUserService,
        private tokenService: ITokenService
    ) {}

    async getNonceMessage(walletAddress: string): Promise<string> {
        const normalizedWallet = walletAddress.toLowerCase();

        const nonceRecord = await this.nonceService.generateNonce(
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

        const nonceRecord = await this.nonceService.getValidNonce(
            normalizedWallet
        );

        const message = createLoginMessage(
            normalizedWallet,
            nonceRecord.nonce,
            nonceRecord.expiresAt.toISOString()
        );

        await this.signatureService.verifyWalletSignature(
            message,
            signature,
            normalizedWallet
        );

        const user = await this.userService.identifyUser(normalizedWallet);

        const token = await this.tokenService.sign({
            walletAddress: normalizedWallet,
            userId: user.id,
        });

        await this.nonceService.deleteNonce(normalizedWallet);

        return { token };
    }
}

export default AuthService;
