type TokenPayload = {
    userId: string;
    walletAddress: string;
};

export interface ITokenService {
    sign(payload: TokenPayload): Promise<string>;
}
