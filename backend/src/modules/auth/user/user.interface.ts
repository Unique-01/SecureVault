export interface UserRecord {
    id: string;
}

export interface IUserService {
    getUser(walletAddress: string): Promise<UserRecord | null>;
    createUser(walletAddress: string): Promise<UserRecord>;
    updateUserLastLogin(walletAddress: string): Promise<void>;
}
