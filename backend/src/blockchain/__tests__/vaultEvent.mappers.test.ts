import { describe, it, expect } from "vitest";
import { mapEventType, extractAmount } from "../vaultEvent.mappers.js";

describe("mapEventType", () => {
    it("Should return the DEPOSIT when event is UserDeposited", () => {
        const result = mapEventType("UserDeposited");

        expect(result).toBe("DEPOSIT");
    });

    it("Should return WITHDRAW_REQUEST when the event is UserRequestedWithdrawal", () => {
        const result = mapEventType("UserRequestedWithdrawal");

        expect(result).toBe("WITHDRAW_REQUEST");
    });

    it("should return WITHDRAW_EXECUTED for UserWithdrawn event", () => {
        const result = mapEventType("UserWithdrawn");

        expect(result).toBe("WITHDRAW_EXECUTED");
    });

    it("should return WITHDRAW_MODIFIED when the event is UserModifiedPendingWithdrawal", () => {
        const result = mapEventType("UserModifiedPendingWithdrawal");

        expect(result).toBe("WITHDRAW_MODIFIED");
    });

    it("should return WITHDRAW_CANCELLED for UserCancelledPendingWithdrawal event", () => {
        const result = mapEventType("UserCancelledPendingWithdrawal");

        expect(result).toBe("WITHDRAW_CANCELLED");
    });

    it("Should return UNKNOWN for unrecognized events", () => {
        const result = mapEventType("ContractCreated");

        expect(result).toBe("UNKNOWN");
    });
});

describe("extractAmount", () => {
    it("Should return deposit amount when the event is UserDeposited", () => {
        const args = { amount: 30n };

        const result = extractAmount("UserDeposited", args);

        expect(result).toBe("30");
    });

    it("Should return requested withdrawal amount when the event is UserRequestedWithdrawal", () => {
        const args = { amount: 50n };

        const result = extractAmount("UserRequestedWithdrawal", args);

        expect(result).toBe("50");
    });

    it("Should return withdrawn  amount when the event is UserWithdrawn", () => {
        const args = { amount: 1000n };

        const result = extractAmount("UserWithdrawn", args);

        expect(result).toBe("1000");
    });

    it("Should return correct newAmount for modified pending withdrawal event", () => {
        const args = { newAmount: 100n };

        const result = extractAmount("UserModifiedPendingWithdrawal", args);

        expect(result).toBe("100");
    });

    it("Should return 0 for events with unspecified amounts", () => {
        const result = extractAmount("UserCancelledWithdrawal", {});

        expect(result).toBe("0");
    });
});
