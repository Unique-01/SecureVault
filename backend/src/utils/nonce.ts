import crypto from "crypto";

/**
 * Generates a cryptographically secure random nonce
 * @param length Length of the random string in bytes (default 16)
 * @returns Hex string
 */
export function generateNonce(length: number = 16): string {
    return crypto.randomBytes(length).toString("hex");
}
