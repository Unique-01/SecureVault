import { describe, it, vi, expect, beforeEach, afterEach } from "vitest";
import JwtService from "../services/jwt.service.js";
import { TokenPayload } from "../interface/token.interface.js";
import jwt from "jsonwebtoken";
import { ExpiredTokenError, InvalidTokenError } from "../errors/tokenErrors.js";

const jwtPayload: TokenPayload = {
    userId: "user123",
    walletAddress: "0xabc",
};

describe("JwtService", () => {
    const secret = "jwt-test-secret";
    const expiresIn = "1h";
    let jwtService: JwtService;
    beforeEach(() => {
        jwtService = new JwtService(secret, expiresIn);
    });
    describe("Constructor", () => {
        it("should throw error if secret key is missing", () => {
            expect(() => new JwtService("", expiresIn)).toThrow(
                "JWT_SECRET is not defined"
            );
        });
    });

    describe("sign()", () => {
        it("should return valid token string with correct payload", async () => {
            const token = await jwtService.sign(jwtPayload);

            expect(typeof token).toBe("string");

            const decoded = jwt.verify(token, secret) as {
                userId: string;
                walletAddress: string;
                iat?: number;
                exp?: number;
            };

            expect(token.split(".")).toHaveLength(3);
            expect(decoded.userId).toBe(jwtPayload.userId);
            expect(decoded.walletAddress).toBe(jwtPayload.walletAddress);
            expect(decoded.iat).toBeDefined();
            expect(decoded.exp).toBeDefined();
        });
    });
    describe("verify()", () => {
        afterEach(() => {
            vi.useRealTimers();
        });

        it("should return payload for a valid token", async () => {
            const token = jwt.sign(jwtPayload, secret, { expiresIn });

            const result = await jwtService.verify(token);

            expect(result).toBeDefined();
            expect(result).toMatchObject(jwtPayload);
        });
        it("should throw ExpiredTokenError if token is expired", async () => {
            vi.useFakeTimers();

            const token = jwt.sign(jwtPayload, secret, { expiresIn });

            vi.advanceTimersByTime(1000 * 60 * 60 * 2); // fast forward time by 2 hours

            await expect(jwtService.verify(token)).rejects.toThrowError(
                ExpiredTokenError
            );
        });

        it("should throw InvalidTokenError if token is invalid", async () => {
            const token = "randomToken";

            await expect(jwtService.verify(token)).rejects.toThrow(
                InvalidTokenError
            );
        });

        it("should throw InvalidTokenError if token signed with wrong secret", async () => {
            const token = jwt.sign(jwtPayload, "randomSecret", { expiresIn });

            await expect(jwtService.verify(token)).rejects.toThrow(
                InvalidTokenError
            );
        });

        it("should throw invalidTokenError for empty token", async () => {
            await expect(jwtService.verify("")).rejects.toThrow(
                InvalidTokenError
            );
        });
    });
});
