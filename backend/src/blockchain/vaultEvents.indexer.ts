import { secureVaultAbi } from "./secureVault.abi.js";
import { mapEventType, extractAmount } from "./vaultEvent.mappers.js";
import { IBlockChainClient } from "./blockchain.interface.js";
import { IVaultWriter } from "@modules/vault/vault.interface.js";

class VaultEventIndexer {
    constructor(
        private blockchainClient: IBlockChainClient,
        private vaultWriter: IVaultWriter,
        private vaultAddress: `0x${string}`
    ) {}

    async latestBlock(){
        return await this.blockchainClient.getBlockNumber();
    }

    async indexRange(fromBlock: bigint, toBlock: bigint) {
        console.log(
            `Indexing SecureVault Events from block ${fromBlock} to ${toBlock}`
        );

        const logs = await this.blockchainClient.getLogs({
            address: this.vaultAddress,
            events: secureVaultAbi,
            fromBlock,
            toBlock,
        });

        const blockCache = new Map<bigint, any>();

        for (const log of logs) {
            const { eventName, args, blockNumber, transactionHash } = log;

            if (!blockNumber || !transactionHash || !eventName) continue;

            if (!blockCache.has(blockNumber)) {
                const block = await this.blockchainClient.getBlock({
                    blockNumber,
                });
                blockCache.set(blockNumber, block);
            }

            const block = blockCache.get(blockNumber);
            const walletAddress: string =
                (args as any)?.user?.toLowerCase?.() ?? "unknown";

            await this.vaultWriter.saveVaultEvent({
                walletAddress,
                txHash: transactionHash,
                blockNumber: Number(blockNumber),
                timestamp: new Date(Number(block?.timestamp) * 1000),
                eventType: mapEventType(eventName),
                amount: extractAmount(eventName, args),
            });
        }

        return logs.length;
    }
}

export default VaultEventIndexer;
