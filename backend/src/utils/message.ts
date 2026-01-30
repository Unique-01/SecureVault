/**
 * Creates a structured login message for the user to sign
 * @param walletAddress User's wallet address
 * @param nonce Secure random nonce
 * @param expiresAt ISO timestamp string
 * @returns Structured message string
 */

export function createLoginMessage(
    walletAddress: string,
    nonce: string,
    expiresAt: string
): string {
    return `Sign this message to login to SecureVault:
Wallet: ${walletAddress}
Nonce: ${nonce}
Expires At: ${expiresAt}`;
}
