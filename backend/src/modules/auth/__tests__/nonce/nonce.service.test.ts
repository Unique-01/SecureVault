import { describe, vi, it, expect, Mock, beforeEach, afterEach } from "vitest";
import NonceService from "@modules/auth/nonce/nonce.service.js";
import {
    INonceRepository,
    NonceRecord,
} from "@modules/auth/nonce/nonce.interface.js";
import { WalletRequiredError } from "@modules/auth/errors/authError.js";
import {
    NonceIsExpiredError,
    NonceNotFoundError,
} from "@modules/auth/nonce/errors/NonceErrors.js";

const WALLET_NORMALIZED = "0xabc123";
const NONCE = "abc123nonce";
const FAKE_NOW = new Date("2024-01-01T00:00:00.000Z");
const FUTURE_DATE = new Date(FAKE_NOW.getTime() + 5 * 60_000);

const nonceRecord: NonceRecord = {
    walletAddress: WALLET_NORMALIZED,
    nonce: NONCE,
    expiresAt: FUTURE_DATE,
};

const makeNonceRepo = (overrides = {}): INonceRepository => ({
    createNonce: vi.fn().mockResolvedValue(nonceRecord),
    retrieveNonce: vi.fn().mockResolvedValue(nonceRecord),
    deleteNonce: vi.fn().mockResolvedValue(undefined),
    ...overrides,
});

describe("generateNonce", () => {
    beforeEach(() => {
        vi.useFakeTimers().setSystemTime(FAKE_NOW);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });
    it("should generate nonce with a 5 minute expiration and save it", async () => {
        const repo = makeNonceRepo();
        const nonceService = new NonceService(repo);

        const result = await nonceService.generateNonce(WALLET_NORMALIZED);

        expect(repo.createNonce).toHaveBeenCalledOnce();

        const [walletAddress, nonce, expiresAt] = (repo.createNonce as Mock)
            .mock.calls[0];

        expect(walletAddress).toBe(WALLET_NORMALIZED);

        expect(nonce).toEqual(expect.any(String));

        const expectedTime = FAKE_NOW.getTime() + 5 * 60_000;
        expect(expiresAt.getTime()).toBe(expectedTime);

        expect(result).toBe(nonceRecord);
    });

    it("should throw error if wallet Address is empty", async () => {
        const repo = makeNonceRepo();
        const nonceService = new NonceService(repo);

        await expect(nonceService.generateNonce(" ")).rejects.toThrowError(
            WalletRequiredError
        );
        expect(repo.createNonce).not.toHaveBeenCalled();
    });

    it("should throw error is wallet address is missing", async () => {
        const repo = makeNonceRepo();
        const nonceService = new NonceService(repo);

        await expect(nonceService.generateNonce("")).rejects.toThrowError(
            WalletRequiredError
        );

        expect(repo.createNonce).not.toHaveBeenCalled();
    });
});

describe("getValidNonce", () => {
    beforeEach(() => {
        vi.useFakeTimers().setSystemTime(FAKE_NOW);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });
    it("should return correct nonce from repo", async () => {
        const repo = makeNonceRepo();
        const nonceService = new NonceService(repo);

        const result = await nonceService.getValidNonce(WALLET_NORMALIZED);

        expect(repo.retrieveNonce).toHaveBeenCalledOnce();

        expect(repo.retrieveNonce).toHaveBeenCalledWith(WALLET_NORMALIZED);

        expect(result).toBe(nonceRecord);
    });

    it("should throw error if wallet address is empty", async () => {
        const repo = makeNonceRepo();
        const nonceService = new NonceService(repo);

        await expect(nonceService.getValidNonce(" ")).rejects.toThrowError(
            WalletRequiredError
        );

        expect(repo.retrieveNonce).not.toHaveBeenCalled();
    });

    it("should throw error if nonce is expired", async () => {
        const expiredTime = new Date(FAKE_NOW.getTime() + 20 * 60_000);
        vi.useFakeTimers().setSystemTime(expiredTime);

        const repo = makeNonceRepo();
        const nonceService = new NonceService(repo);

        await expect(
            nonceService.getValidNonce(WALLET_NORMALIZED)
        ).rejects.toThrowError(NonceIsExpiredError);
    });

    it("should throw error is nonce is not found", async () => {
        const repo = makeNonceRepo({
            retrieveNonce: vi.fn().mockResolvedValue(null),
        });
        const nonceService = new NonceService(repo);

        await expect(
            nonceService.getValidNonce(WALLET_NORMALIZED)
        ).rejects.toThrowError(NonceNotFoundError);
    });
});

describe("deleteNonce", () => {
    it("should throw error if wallet Address is empty", async () => {
        const repo = makeNonceRepo();
        const nonceService = new NonceService(repo);

        await expect(nonceService.deleteNonce(" ")).rejects.toThrowError(
            WalletRequiredError
        );

        expect(repo.deleteNonce).not.toHaveBeenCalled();
    });

    it("should correctly delete nonce and return undefined", async () => {
        const repo = makeNonceRepo();
        const nonceService = new NonceService(repo);

        const result = await nonceService.deleteNonce(WALLET_NORMALIZED);

        expect(repo.deleteNonce).toHaveBeenCalled();
        expect(repo.deleteNonce).toHaveBeenCalledWith(WALLET_NORMALIZED);
        expect(result).toBe(undefined);
    });
});
