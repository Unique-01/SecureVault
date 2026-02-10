import { generateNonce } from "@utils/nonce.js";
import { prisma } from "@prisma/client.js";
import { createLoginMessage } from "@utils/message.js";
import { Hex, recoverMessageAddress } from "viem";
import { signJwt } from "@utils/jwt.js";

export async function getNonceMessage(walletAddress: string): Promise<string> {
    const normalizedWallet = walletAddress.toLowerCase();

    const nonce = generateNonce(16);

    // Expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60_000);

    await prisma.authNonce.upsert({
        where: { walletAddress: normalizedWallet },
        update: { nonce, expiresAt },
        create: { walletAddress: normalizedWallet, nonce, expiresAt },
    });

    return createLoginMessage(normalizedWallet, nonce, expiresAt.toISOString());
}

export async function verifySignature(
    walletAddress: string,
    signature: string
): Promise<{ token: string }> {
    console.log("Verify signature function called.")
    const normalizedWallet = walletAddress.toLowerCase();

    const authNonce = await prisma.authNonce.findUnique({
        where: { walletAddress: normalizedWallet },
    });

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

    let user = await prisma.user.findUnique({
        where: { walletAddress: normalizedWallet },
    });

    if (!user) {
        user = await prisma.user.create({
            data: { walletAddress: normalizedWallet },
        });
    }

    await prisma.user.update({
        where: { walletAddress: normalizedWallet },
        data: { lastLoginAt: new Date() },
    });

    const token = signJwt({ walletAddress: normalizedWallet, userId: user.id });

    await prisma.authNonce.delete({
        where: { walletAddress: normalizedWallet },
    });

    return { token };
}
