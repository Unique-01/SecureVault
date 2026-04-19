import { describe, vi, expect, it, beforeEach } from "vitest";
import { recoverMessageAddress } from "viem";
import { EvmSignatureService } from "@modules/auth/signature/signature.service.js";
import { InvalidSignatureError } from "@modules/auth/signature/errors/SignatureErrors.js";

const expectedWallet = "0xabc";
const message = "Sign in with your wallet";
const signature = "0x123";

vi.mock("viem", () => ({
    recoverMessageAddress: vi.fn(),
}));

describe("EvmSignatureService", () => {
    const service = new EvmSignatureService();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("verifyWalletSignature", () => {
        it("should return expected wallet with no errors", async () => {
            vi.mocked(recoverMessageAddress).mockResolvedValue(expectedWallet);

            await expect(
                service.verifyWalletSignature(
                    message,
                    signature,
                    expectedWallet
                )
            ).resolves.not.toThrowError();

            expect(recoverMessageAddress).toHaveBeenCalledWith({
                message: message,
                signature: signature,
            });
        });
        it("should throw error if recovered wallet does not match expected wallet", async () => {
            const randomWallet = "0xrandomWallet";
            vi.mocked(recoverMessageAddress).mockResolvedValue(randomWallet);

            await expect(
                service.verifyWalletSignature(
                    message,
                    signature,
                    expectedWallet
                )
            ).rejects.toThrowError(InvalidSignatureError);
        });

        it("should handle wallet case sensitivity correctly", async () => {
            const mixedCaseWallet = "0xABC";

            vi.mocked(recoverMessageAddress).mockResolvedValue(mixedCaseWallet);

            await expect(
                service.verifyWalletSignature(
                    message,
                    signature,
                    expectedWallet
                )
            ).resolves.not.toThrowError();
        });

        it("should shows errors from external library", async () => {
            const error = new Error("Invalid Signature Length");

            vi.mocked(recoverMessageAddress).mockRejectedValue(error);

            await expect(
                service.verifyWalletSignature(
                    message,
                    "invalid-sig",
                    expectedWallet
                )
            ).rejects.toThrowError(error);
        });
    });
});
