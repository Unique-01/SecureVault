import { describe, it, expect, vi } from "vitest";
import { getTotalVolume } from "../vault.service.js";
import { VaultEventRecord, DecimalValue } from "src/types/vaultEvent.types.js";
import Decimal from "decimal.js";

const makeEvent = (amount: DecimalValue | null): VaultEventRecord => ({
    id: "1",
    walletAddress: "0xabc",
    eventType: "DEPOSIT",
    amount,
    txHash: "0x123",
    blockNumber: 1,
    timestamp: new Date(),
});

const walletAddress = "0xabc";

const makeFakeRepo = (events: VaultEventRecord[]) => ({
    getEventsByWallet: async () => events,
});

describe("getTotalVolume", () => {
    it("Returns 0.00 when there are no events", async () => {
        const repo = makeFakeRepo([]);
        const result = await getTotalVolume(walletAddress, repo);
        expect(result).toBe("0.00");
    });

    it("Return the correct sum for the amount in the events", async () => {
        const repo = makeFakeRepo([
            makeEvent(new Decimal(20)),
            makeEvent(new Decimal(10)),
        ]);
        const result = await getTotalVolume(walletAddress, repo);
        expect(result).toBe("30.00");
    });

    it("Skips null amount and return correct sum for the non null amount in events", async () => {
        const repo = makeFakeRepo([
            makeEvent(null),
            makeEvent(new Decimal(20)),
            makeEvent(new Decimal(10)),
        ]);
        const result = await getTotalVolume(walletAddress, repo);

        expect(result).toBe("30.00");
    });

    it("Should return 0.00 if the amount is null in all events", async () => {
        const repo = makeFakeRepo([
            makeEvent(null),
            makeEvent(null),
            makeEvent(null),
        ]);
        const result = await getTotalVolume(walletAddress, repo);
        expect(result).toBe("0.00");
    });
});
