import { Request, Response } from "express";
import { getNonceMessage, verifySignature } from "./auth.service.js";

export async function requestNonce(req: Request, res: Response) {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress) {
            return res
                .status(400)
                .json({ error: "Wallet Address is required" });
        }

        const message = await getNonceMessage(walletAddress);
        return res.json({ message });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const verifyNonce = async (req: Request, res: Response) => {
    try {
        const { walletAddress, signature } = req.body;

        if (!walletAddress || !signature) {
            return res
                .status(400)
                .json({ error: "Wallet address and signature are required" });
        }

        const { token } = await verifySignature(walletAddress, signature);

        return res.json({ token });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
};
