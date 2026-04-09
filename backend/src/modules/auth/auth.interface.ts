export type Hex = `0x${string}`;

// export interface NonceRecord {
//     walletAddress: string;
//     nonce: string;
//     expiresAt: Date;
// }

// export interface UserRecord {
//     walletAddress: string;
//     id: string;
//     lastLoginAt: Date | null;
// }

// export interface INonceWriter {
//     upsertNonce(
//         wallet: string,
//         nonce: string,
//         expiresAt: Date
//     ): Promise<NonceRecord>;
// }



// export interface ISignatureVerifier {
//     findNonce(wallet: string): Promise<NonceRecord | null>;

//     findUser(wallet: string): Promise<UserRecord | null>;

//     createUser(wallet: string): Promise<UserRecord>;

//     updateUserLastLogin(wallet: string): Promise<UserRecord>;

//     deleteNonce(wallet: string): Promise<NonceRecord>;
// }

// export type NonceGenerator = () => string;

// export type AddressRecoverer = (params: {
//     message: string;
//     signature: Hex;
// }) => Promise<Hex>;

// export type JwtSigner = (payload: {
//     walletAddress: string;
//     userId: string;
// }) => string;
