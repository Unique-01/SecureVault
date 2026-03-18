import { describe, it, expect, vi } from "vitest";
import { getNonceMessage, verifySignature } from "../auth.service.js";
import type {
    AddressRecoverer,
    IAuthRepository,
    JwtSigner,
    NonceGenerator,
    NonceRecord,
    UserRecord,
} from "../auth.interface.js";
import { createLoginMessage } from "@utils/message.js";

const FAKE_WALLET = "0xABC123";
const FAKE_WALLET_NORMALIZED = "0xabc123";
const FAKE_NONCE = "abc123nonce";
const FAKE_TOKEN = "fake.jwt.token";
const FAKE_SIGNATURE = "fake.signature";
const FAKE_NOW = new Date("2024-01-01T00:00:00.000Z");
const FUTURE_DATE = new Date(FAKE_NOW.getTime() + 5 * 60_000);

const makeRepo = (overrides = {}): IAuthRepository => ({
    upsertNonce: vi.fn().mockResolvedValue(undefined),
    findNonce: vi.fn().mockResolvedValue({
        walletAddress: FAKE_WALLET_NORMALIZED,
        nonce: FAKE_NONCE,
        expiresAt: FUTURE_DATE,
    }),
    findUser: vi.fn().mockResolvedValue(null),
    createUser: vi.fn().mockResolvedValue({
        id: "user1",
        walletAddress: FAKE_WALLET,
        lastLoginAt: null,
    }),
    updateUserLastLogin: vi.fn().mockResolvedValue(undefined),
    deleteNonce: vi.fn().mockResolvedValue(undefined),
    ...overrides,
});

const makeNonceGenerator = (): NonceGenerator =>
    vi.fn().mockReturnValue(FAKE_NONCE);

const makeAddressRecoverer = (
    address = FAKE_WALLET_NORMALIZED
): AddressRecoverer => vi.fn().mockResolvedValue(address);

const makeJwtSigner = (): JwtSigner => vi.fn().mockReturnValue(FAKE_TOKEN);

describe("getNonceMessage", () => {
    it("should return a login message", async () => {
        const result = await getNonceMessage(
            FAKE_WALLET_NORMALIZED,
            makeRepo(),
            makeNonceGenerator(),
            FAKE_NOW
        );

        const expectedExpiresAt = new Date(FAKE_NOW.getTime() + 5 * 60_000);

        const expectedResult = createLoginMessage(
            FAKE_WALLET_NORMALIZED,
            FAKE_NONCE,
            expectedExpiresAt.toISOString()
        );

        expect(result).toBe(expectedResult);
    });

    it("should call upsertNonce with normalized wallet Address and correct nonce", async () => {
        const repo = makeRepo();

        await getNonceMessage(FAKE_WALLET, repo, makeNonceGenerator());

        expect(repo.upsertNonce).toHaveBeenCalledWith(
            FAKE_WALLET_NORMALIZED,
            FAKE_NONCE,
            expect.anything()
        );
    });
});

describe("verifyMessage", () => {
    it("should return the correct token on success", async () => {
        const repo = makeRepo();
        const result = await verifySignature(
            FAKE_WALLET,
            FAKE_SIGNATURE,
            repo,
            makeAddressRecoverer(),
            makeJwtSigner(),
            FAKE_NOW
        );

        expect(repo.updateUserLastLogin).toHaveBeenCalledExactlyOnceWith(
            FAKE_WALLET_NORMALIZED
        );
        expect(repo.deleteNonce).toHaveBeenCalledExactlyOnceWith(
            FAKE_WALLET_NORMALIZED
        );
        expect(result.token).toBe(FAKE_TOKEN);
    });

    it("should throw error if nonce does not exist in db", async () => {
        const repo = makeRepo({ findNonce: vi.fn().mockResolvedValue(null) });

        await expect(
            verifySignature(
                FAKE_WALLET,
                FAKE_SIGNATURE,
                repo,
                makeAddressRecoverer(),
                makeJwtSigner(),
                FAKE_NOW
            )
        ).rejects.toThrowError("Nonce not found. Request a new one");
    });

    it("Should throw error if nonce is expired", async () => {
        const expired_date = new Date(FAKE_NOW.getTime() - 10 * 60_000);

        const repo = makeRepo({
            findNonce: vi.fn().mockResolvedValue({
                walletAddress: FAKE_WALLET_NORMALIZED,
                nonce: FAKE_NONCE,
                expiresAt: expired_date,
            }),
        });

        await expect(
            verifySignature(
                FAKE_WALLET,
                FAKE_SIGNATURE,
                repo,
                makeAddressRecoverer(),
                makeJwtSigner(),
                FAKE_NOW
            )
        ).rejects.toThrowError("Nonce is expired. Request a new one");
    });

    it("should not create user if user already exists", async () => {
        const repo = makeRepo({
            findUser: vi.fn().mockResolvedValue({
                walletAddress: FAKE_WALLET_NORMALIZED,
                id: "user1",
            }),
        });

        await verifySignature(
            FAKE_WALLET,
            FAKE_SIGNATURE,
            repo,
            makeAddressRecoverer(),
            makeJwtSigner(),
            FAKE_NOW
        );

        expect(repo.createUser).toHaveBeenCalledTimes(0);
        expect(repo.findUser).toHaveBeenCalledWith(FAKE_WALLET_NORMALIZED);
    });

    it("should create user if user does not exist", async () => {
        const repo = makeRepo();

        await verifySignature(
            FAKE_WALLET,
            FAKE_SIGNATURE,
            repo,
            makeAddressRecoverer(),
            makeJwtSigner(),
            FAKE_NOW
        );

        expect(repo.createUser).toHaveBeenCalledWith(FAKE_WALLET_NORMALIZED);
    });

    it("should throw error of recovered wallet does not match normalized wallet", async () => {
        const repo = makeRepo();
        const random_wallet = "0xRandomWallet";

        await expect(
            verifySignature(
                FAKE_WALLET,
                FAKE_SIGNATURE,
                repo,
                makeAddressRecoverer(random_wallet),
                makeJwtSigner(),
                FAKE_NOW
            )
        ).rejects.toThrowError("Invalid signature.");
    });
});
