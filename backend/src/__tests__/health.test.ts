import request from "supertest";
import app from "../app.js";
import { describe, expect, it } from "vitest";

describe("Health Route", () => {
    it("Should return 200 and status ok", async () => {
        const response = await request(app).get("/health");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "ok" });
    });

    it("Should return JSON content-type", async () => {
        const response = await request(app).get("/health");

        expect(response.headers["content-type"]).toContain("application/json");
    });
});
