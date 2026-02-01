import { generateNonce } from "@utils/nonce.js";
import { prisma } from "@prisma/client.js";
import { createLoginMessage } from "@utils/message.js";

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
