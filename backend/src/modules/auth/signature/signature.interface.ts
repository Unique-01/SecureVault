export type Hex = `0x${string}`;

export interface ISignatureService {
    confirmWalletSignature(
        message: string,
        signature: Hex,
        expectedWallet: string
    ): Promise<void>;
}
