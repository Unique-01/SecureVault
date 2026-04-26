import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    ITokenService,
    TokenPayload,
} from "src/common/token/interface/token.interface.js";
import authMiddleware from "@middlewares/auth.middlewares.js";
import { Request, Response, NextFunction } from "express";
import {
    ExpiredTokenError,
    InvalidTokenError,
} from "src/common/token/errors/tokenErrors.js";

describe("Auth Middleware", () => {
    const mockRes = {} as Response;

    const mockNext = vi.fn();

    const mockTokenPayload: TokenPayload = {
        userId: "user123",
        walletAddress: "0xABC123",
    };
    const mockTokenService: ITokenService = {
        sign: vi.fn(),
        verify: vi.fn(),
    };

    const middleware = authMiddleware(mockTokenService);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should set req.user and call next on successful verification", async () => {
        const mockReq = {
            headers: {
                authorization: "Bearer valid-token",
            },
        } as unknown as Request;

        vi.mocked(mockTokenService.verify).mockResolvedValue(mockTokenPayload);

        await middleware(mockReq, mockRes, mockNext);

        expect(mockReq.user).toBe(mockTokenPayload);
        expect(mockNext).toHaveBeenCalled();
    });

    it("should throw InvalidTokenError if token header is not provided", async () => {
        const mockReq = {
            headers: {},
        } as unknown as Request;

        await expect(middleware(mockReq, mockRes, mockNext)).rejects.toThrow(
            InvalidTokenError
        );
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw InvalidTokenError if token header provided is invalid", async () => {
        const mockReq = {
            headers: {
                authorization: "random-token",
            },
        } as unknown as Request;

        await expect(middleware(mockReq, mockRes, mockNext)).rejects.toThrow(
            InvalidTokenError
        );
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should throw InvalidTokenError if Bearer prefix has no space", async () => {
        const mockReq = {
            headers: { authorization: "Bearer" },
        } as unknown as Request;

        await expect(middleware(mockReq, mockRes, mockNext)).rejects.toThrow(
            InvalidTokenError
        );
    });

    it("should propagate errors from tokenService without calling next", async () => {
        const mockReq = {
            headers: {
                authorization: "Bearer valid-token",
            },
        } as unknown as Request;

        vi.mocked(mockTokenService.verify).mockRejectedValue(
            new ExpiredTokenError()
        );

        await expect(middleware(mockReq, mockRes, mockNext)).rejects.toThrow(
            ExpiredTokenError
        );

        expect(mockNext).not.toHaveBeenCalled();
    });
});
