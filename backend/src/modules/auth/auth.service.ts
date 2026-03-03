import { generateNonce } from "@utils/nonce.js";
import { createLoginMessage } from "@utils/message.js";
import { Hex, recoverMessageAddress } from "viem";
import { signJwt } from "@utils/jwt.js";
import { IAuthRepository } from "./auth.interface.js";

export async function getNonceMessage(
    walletAddress: string,
    repo: IAuthRepository
): Promise<string> {
    const normalizedWallet = walletAddress.toLowerCase();

    const nonce = generateNonce(16);

    // Expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60_000);

    await repo.upsertNonce(normalizedWallet, nonce, expiresAt);

    return createLoginMessage(normalizedWallet, nonce, expiresAt.toISOString());
}

export async function verifySignature(
    walletAddress: string,
    signature: string,
    repo: IAuthRepository
): Promise<{ token: string }> {
    const normalizedWallet = walletAddress.toLowerCase();

    const authNonce = await repo.findNonce(normalizedWallet);

    if (!authNonce) {
        throw new Error("Nonce not found. Request a new one");
    }

    const now = new Date();

    if (authNonce.expiresAt < now) {
        throw new Error("Nonce is expired. Request a new one");
    }

    const message = createLoginMessage(
        normalizedWallet,
        authNonce.nonce,
        authNonce.expiresAt.toISOString()
    );

    const recoveredWallet = await recoverMessageAddress({
        message,
        signature: signature as Hex,
    });

    if (recoveredWallet.toLowerCase() !== normalizedWallet) {
        throw new Error("Invalid signature.");
    }

    let user = await repo.findUser(normalizedWallet);

    if (!user) {
        user = await repo.createUser(normalizedWallet);
    }

    await repo.updateUserLastLogin(normalizedWallet);

    const token = signJwt({ walletAddress: normalizedWallet, userId: user.id });

    await repo.deleteNonce(normalizedWallet);

    return { token };
}
