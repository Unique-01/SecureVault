export interface NonceRecord {
    walletAddress: string;
    nonce: string;
    expiresAt: Date;
}

export interface INonceWriter {
    generateNonce(walletAddress: string): Promise<NonceRecord>;
}

export interface INonceVerifier {
    findAndValidateNonce(walletAddress: string): Promise<NonceRecord>;
    deleteNonce(walletAddress: string): Promise<void>;
}
