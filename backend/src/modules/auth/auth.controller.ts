import { Request, Response } from "express";
import AuthService from "./auth.service.js";
import {
    WalletAndSignatureRequiredError,
    WalletRequiredError,
} from "./errors/authError.js";

class AuthController {
    constructor(private authService: AuthService) {}

    requestNonce = async (req: Request, res: Response) => {
        /*  #swagger.tags = ['Auth']
            #swagger.summary = 'Step 1: Get a cryptographic nonce'
            #swagger.parameters['body'] = {
                in: 'body',
                description: 'The wallet address you want to log in with',
                schema: { walletAddress: "0x123..." }
            }
            #swagger.responses[200] = { schema: { $ref: "#/definitions/AuthNonceResponse" } }
        */
        const { walletAddress } = req.body;

        if (!walletAddress || !walletAddress.trim()) {
            throw new WalletRequiredError();
        }

        const message = await this.authService.getNonceMessage(walletAddress);

        return res.json({ message });
    };

    verifyNonce = async (req: Request, res: Response) => {
        /*  #swagger.tags = ['Auth']
            #swagger.summary = 'Step 2: Verify signature and get JWT'
            #swagger.parameters['body'] = {
                in: 'body',
                description: 'The signature produced by the wallet',
                schema: { walletAddress: "0x123...", signature: "0x..." }
            }
            #swagger.responses[200] = { schema: { $ref: "#/definitions/AuthVerifyResponse" } }
        */

        const { walletAddress, signature } = req.body;

        if (!walletAddress || !signature) {
            throw new WalletAndSignatureRequiredError();
        }

        const { token } = await this.authService.verifySignature(
            walletAddress,
            signature
        );

        return res.json({ token });
    };
}

export default AuthController;
