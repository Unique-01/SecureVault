import { secureVaultAbi } from "./secureVault.abi.js";
import { mapEventType, extractAmount } from "./vaultEvent.mappers.js";
import { IBlockChainClient } from "./blockchain.interface.js";
import { IVaultWriter } from "@modules/vault/vault.interface.js";

const VAULT_ADDRESS = process.env.VAULT_ADDRESS as `0x${string}` | undefined;

if (!VAULT_ADDRESS) {
    throw new Error("VAULT_ADDRESS is not defined in environment variables");
}

export const indexSecureVaultEvents = async (
    fromBlock: bigint,
    toBlock: bigint,
    blockchainClient: IBlockChainClient,
    vaultWriter: IVaultWriter
) => {
    console.log(`Indexing SecureVault Events from block ${fromBlock}`);

    const logs = await blockchainClient.getLogs({
        address: VAULT_ADDRESS,
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
