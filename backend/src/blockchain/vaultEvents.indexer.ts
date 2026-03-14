import { secureVaultAbi } from "./secureVault.abi.js";
import { mapEventType, extractAmount } from "./vaultEvent.mappers.js";
import { IBlockChainClient } from "./blockchain.interface.js";
import { IVaultWriter } from "@modules/vault/vault.interface.js";

export const indexSecureVaultEvents = async (
    fromBlock: bigint,
    toBlock: bigint,
    blockchainClient: IBlockChainClient,
    vaultWriter: IVaultWriter,
    vaultAddress: `0x${string}`
) => {
    console.log(`Indexing SecureVault Events from block ${fromBlock}`);

    const logs = await blockchainClient.getLogs({
        address: vaultAddress,
        events: secureVaultAbi,
        fromBlock,
        toBlock,
    });

    const blockCache = new Map<
        bigint,
        Awaited<ReturnType<typeof blockchainClient.getBlock>>
    >();

    for (const log of logs) {
        const { eventName, args, blockNumber, transactionHash } = log;

        if (!blockNumber || !transactionHash || !eventName) continue;

        if (!blockCache.has(blockNumber)) {
            const block = await blockchainClient.getBlock({ blockNumber });
            blockCache.set(blockNumber, block);
        }

        const block = blockCache.get(blockNumber);

        const walletAddress: string =
            (args as any)?.user?.toLowerCase?.() ?? "unknown";

        await vaultWriter.saveVaultEvent({
            walletAddress,
            txHash: transactionHash,
            blockNumber: Number(blockNumber),
            timestamp: new Date(Number(block?.timestamp) * 1000),
            eventType: mapEventType(eventName),
            amount: extractAmount(eventName, args),
        });
    }
    console.log(`Indexed ${logs.length} events`);
};
