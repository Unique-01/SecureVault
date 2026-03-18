import { createLoginMessage } from "@utils/message.js";
import {
    IAuthRepository,
    NonceGenerator,
    AddressRecoverer,
    JwtSigner,
    Hex,
} from "./auth.interface.js";

export async function getNonceMessage(
    walletAddress: string,
    repo: IAuthRepository,
    generateNonce: NonceGenerator,
    now: Date = new Date()
): Promise<string> {
    const normalizedWallet = walletAddress.toLowerCase();

    const nonce = generateNonce();

    // Expires in 5 minutes
    const expiresAt = new Date(now.getTime() + 5 * 60_000);

    await repo.upsertNonce(normalizedWallet, nonce, expiresAt);

    return createLoginMessage(normalizedWallet, nonce, expiresAt.toISOString());
}

export async function verifySignature(
    walletAddress: string,
    signature: string,
    repo: IAuthRepository,
    recoverMessageAddress: AddressRecoverer,
    signJwt: JwtSigner,
    now: Date = new Date()
): Promise<{ token: string }> {
    const normalizedWallet = walletAddress.toLowerCase();

    const authNonce = await repo.findNonce(normalizedWallet);

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
