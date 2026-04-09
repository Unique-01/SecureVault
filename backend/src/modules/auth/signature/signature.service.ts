import { Hex, recoverMessageAddress } from "viem";
import { ISignatureService } from "./signature.interface.js";
import { InvalidSignatureError } from "./errors/SignatureErrors.js";

class EvmSignatureService implements ISignatureService {
    async verifyWalletSignature(
        message: string,
        signature: string,
        expectedWallet: string
    ): Promise<void> {
        const recoveredWallet = await recoverMessageAddress({
            message,
            signature: signature as Hex,
        });

        if (recoveredWallet.toLowerCase() !== expectedWallet.toLowerCase()) {
            throw new InvalidSignatureError();
        }
    }
}
