import { describe, it, vi, expect } from "vitest";
import VaultEventIndexer from "../vaultEvents.indexer.js";
import { IBlockChainClient } from "../blockchain.interface.js";
import { IVaultWriter } from "@modules/vault/vault.interface.js";

const makeLog = (overrides = {}) => ({
    eventName: "UserDeposited",
    args: {
        user: "0xabc",
        amount: 100n,
    },
    blockNumber: 1n,
    transactionHash: "0x123",
    ...overrides,
});

const makeBlockchainClient = (logs = [makeLog()]): IBlockChainClient => ({
    getLogs: vi.fn().mockResolvedValue(logs),
    getBlock: vi.fn().mockResolvedValue({ timestamp: 1000n }),
    getBlockNumber: vi.fn().mockResolvedValue(100n),
});

const makeVaultWriter = (): IVaultWriter => ({
    saveVaultEvent: vi.fn().mockResolvedValue(undefined),
});

const vaultAddress =
    "0x1234567890123456789012345678901234567890" as `0x${string}`;

describe("indexVaultEvents", () => {
    it("should not call saveVaultEvent when there's no log", async () => {
        const client = makeBlockchainClient([]);
        const writer = makeVaultWriter();
        const indexer = new VaultEventIndexer(client, writer, vaultAddress);

        await indexer.indexRange(1n, 10n);

        expect(writer.saveVaultEvent).toHaveBeenCalledTimes(0);
    });

    it("should skip logs with missing blockNumber", async () => {
        const client = makeBlockchainClient([makeLog({ blockNumber: null })]);
        const writer = makeVaultWriter();
        const indexer = new VaultEventIndexer(client, writer, vaultAddress);

        await indexer.indexRange(1n, 10n);

        expect(writer.saveVaultEvent).toHaveBeenCalledTimes(0);
    });

    it("should skip logs with missing transaction hash", async () => {
        const client = makeBlockchainClient([
            makeLog({ transactionHash: null }),
        ]);
        const writer = makeVaultWriter();
        const indexer = new VaultEventIndexer(client, writer, vaultAddress);

        await indexer.indexRange(1n, 10n);

        expect(writer.saveVaultEvent).toHaveBeenCalledTimes(0);
    });

    it("should skip logs with missing eventName", async () => {
        const client = makeBlockchainClient([makeLog({ eventName: null })]);
        const writer = makeVaultWriter();
        const indexer = new VaultEventIndexer(client, writer, vaultAddress);

        await indexer.indexRange(1n, 10n);

        expect(writer.saveVaultEvent).toHaveBeenCalledTimes(0);
    });

    it("should call saveVaultEvent only once for a single valid log", async () => {
        const client = makeBlockchainClient([makeLog()]);
        const writer = makeVaultWriter();
        const indexer = new VaultEventIndexer(client, writer, vaultAddress);

        await indexer.indexRange(1n, 10n);

        expect(writer.saveVaultEvent).toHaveBeenCalledOnce();
    });

    it("should call getBlock once for logs with same block Number", async () => {
        const client = makeBlockchainClient([makeLog(), makeLog()]);
        const writer = makeVaultWriter();
        const indexer = new VaultEventIndexer(client, writer, vaultAddress);

        await indexer.indexRange(1n, 10n);

        expect(client.getBlock).toHaveBeenCalledOnce();
    });

    it("should call saveVaultEvent twice for two valid logs", async () => {
        const client = makeBlockchainClient([makeLog(), makeLog()]);
        const writer = makeVaultWriter();
        const indexer = new VaultEventIndexer(client, writer, vaultAddress);

        await indexer.indexRange(1n, 10n);

        expect(writer.saveVaultEvent).toHaveBeenCalledTimes(2);
    });

    it("should call saveVaultEvent with the right data", async () => {
        const client = makeBlockchainClient([makeLog()]);
        const writer = makeVaultWriter();
        const indexer = new VaultEventIndexer(client, writer, vaultAddress);

        await indexer.indexRange(1n, 10n);

        expect(writer.saveVaultEvent).toHaveBeenCalledWith({
            walletAddress: "0xabc",
            txHash: "0x123",
            blockNumber: 1,
            timestamp: new Date(Number(1000n) * 1000),
            eventType: "DEPOSIT",
            amount: "100",
        });
    });
});
