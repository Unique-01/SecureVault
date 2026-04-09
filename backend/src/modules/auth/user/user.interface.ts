export interface UserRecord {
    id: string;
}

export interface IUserService {
    identifyUser(walletAddress: string): Promise<UserRecord>;
}
