import { Request, Response } from "express";
import AuthService from "./auth.service.js";

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

        try {
            const { walletAddress } = req.body;

            if (!walletAddress) {
                return res
                    .status(400)
                    .json({ message: "Wallet Address is required" });
            }

            const message = await this.authService.getNonceMessage(
                walletAddress
            );

            return res.json({ message });
        } catch (error: any) {
            console.error(error.message);
            return res.status(500).json({ message: "Internal server error" });
        }
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
        try {
            const { walletAddress, signature } = req.body;

            if (!walletAddress || !signature) {
                return res.status(400).json({
                    message: "Wallet address and signature are required",
                });
            }

            const { token } = await this.authService.verifySignature(
                walletAddress,
                signature
            );

            return res.json({ token });
        } catch (error: any) {
            console.error(error.message);
            return res.status(500).json({ message: error.message });
        }
    };
}

export default AuthController;
