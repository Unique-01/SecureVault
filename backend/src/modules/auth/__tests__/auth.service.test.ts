import { describe, vi, it, expect, beforeEach } from "vitest";
import { INonceService, NonceRecord } from "../nonce/nonce.interface.js";
import { ISignatureService } from "../signature/signature.interface.js";
import { ITokenService } from "src/common/token/interface/token.interface.js";
import { IUserService } from "../user/user.interface.js";
import AuthService from "../auth.service.js";
import { createLoginMessage } from "@utils/message.js";

describe("AuthService", () => {
    const mockNonceService: INonceService = {
        generateNonce: vi.fn(),
        getValidNonce: vi.fn(),
        deleteNonce: vi.fn(),
    };

    const mockSignatureService: ISignatureService = {
        verifyWalletSignature: vi.fn(),
    };

    const mockUserService: IUserService = {
        identifyUser: vi.fn(),
    };

    const mockTokenService: ITokenService = {
        sign: vi.fn(),
        verify: vi.fn(),
    };

    const rawWallet = "0xABC";
    const normalizedWallet = "0xabc";
    const mockExpiry = new Date("2026-01-01T12:00:00Z");
    const mockNonce = "abc123";
    const mockToken = "jwt-token";
    const mockSignature = "0xSignature";

    const mockNonceRecord: NonceRecord = {
        walletAddress: normalizedWallet,
        nonce: mockNonce,
        expiresAt: mockExpiry,
    };
    const mockMessage = createLoginMessage(
        normalizedWallet,
        mockNonce,
        mockExpiry.toISOString()
    );

    let authService: AuthService;

    beforeEach(() => {
        vi.clearAllMocks();

        authService = new AuthService(
            mockNonceService,
            mockSignatureService,
            mockUserService,
            mockTokenService
        );
    });

    describe("getNonceMessage", () => {
        it("should return a formatted login message with a normalized wallet", async () => {
            vi.mocked(mockNonceService.generateNonce).mockResolvedValue(
                mockNonceRecord
            );

            const result = await authService.getNonceMessage(rawWallet);

            expect(mockNonceService.generateNonce).toHaveBeenCalled();
            expect(mockNonceService.generateNonce).toHaveBeenCalledWith(
                normalizedWallet
            );
            expect(result).toBe(mockMessage);
        });

        it("should throw errors from the nonce service", async () => {
            vi.mocked(mockNonceService.generateNonce).mockRejectedValue(
                new Error("DB Connection Failed")
            );

            await expect(
                authService.getNonceMessage(rawWallet)
            ).rejects.toThrow("DB Connection Failed");
        });
    });
    describe("verifySignature", () => {
        it("should return token and delete nonce after successful verification", async () => {
            const mockUser = {
                id: "user123",
            };
            vi.mocked(mockNonceService.getValidNonce).mockResolvedValue(
                mockNonceRecord
            );

            vi.mocked(
                mockSignatureService.verifyWalletSignature
            ).mockResolvedValue(undefined);

            vi.mocked(mockUserService.identifyUser).mockResolvedValue(mockUser);

            vi.mocked(mockTokenService.sign).mockResolvedValue(mockToken);

            const result = await authService.verifySignature(
                rawWallet,
                mockSignature
            );

            expect(mockNonceService.getValidNonce).toHaveBeenCalledWith(
                normalizedWallet
            );
            expect(
                mockSignatureService.verifyWalletSignature
            ).toHaveBeenCalledWith(
                mockMessage,
                mockSignature,
                normalizedWallet
            );
            expect(mockUserService.identifyUser).toHaveBeenCalledWith(
                normalizedWallet
            );
            expect(mockTokenService.sign).toHaveBeenCalledWith({
                walletAddress: normalizedWallet,
                userId: mockUser.id,
            });
            expect(
                mockNonceService.deleteNonce
            ).toHaveBeenCalledExactlyOnceWith(normalizedWallet);

            expect(result.token).toBe(mockToken);
        });
    });
});
