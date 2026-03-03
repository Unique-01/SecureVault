import { describe, it, expect, vi } from "vitest";
import { requireAuth } from "./auth.middlewares.js";
import { verifyJwt } from "@utils/jwt.js";

vi.mock("@utils/jwt.js");

describe("requireAuth Middleware", () => {
    const mockReq: any = {
        headers: {},
    };

    const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };

    const mockNext = vi.fn();

    it("Should return 401 if no authorization header", async () => {
        requireAuth(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    });
});
