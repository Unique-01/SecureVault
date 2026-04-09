export interface NonceRecord {
    walletAddress: string;
    nonce: string;
    expiresAt: Date;
}

export interface INonceService {
    generateNonce(walletAddress: string): Promise<NonceRecord>;
    getValidNonce(walletAddress: string): Promise<NonceRecord>;
    deleteNonce(walletAddress: string): Promise<void>;
}

export interface INonceRepository {
    createNonce(
        walletAddress: string,
        nonce: string,
        expiresAt: Date
    ): Promise<NonceRecord>;
    retrieveNonce(walletAddress: string): Promise<NonceRecord | null>;
    deleteNonce(walletAddress: string): Promise<void>;
}
