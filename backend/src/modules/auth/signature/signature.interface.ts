export type Hex = `0x${string}`;

export interface ISignatureService {
    verifyWalletSignature(
        message: string,
        signature: string,
        expectedWallet: string
    ): Promise<void>;
}
