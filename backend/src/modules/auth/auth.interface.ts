export interface NonceRecord {
    walletAddress: string;
    nonce: string;
    expiresAt: Date;
}

export interface UserRecord {
    walletAddress: string;
    id: string;
    lastLoginAt: Date | null;
}

export interface IAuthRepository {
    upsertNonce(
        wallet: string,
        nonce: string,
        expiresAt: Date
    ): Promise<NonceRecord>;

    findNonce(wallet: string): Promise<NonceRecord | null>;

    findUser(wallet: string): Promise<UserRecord | null>;

    createUser(wallet: string): Promise<UserRecord>;

    updateUserLastLogin(wallet: string): Promise<UserRecord>;

    deleteNonce(wallet: string): Promise<NonceRecord>;
}
