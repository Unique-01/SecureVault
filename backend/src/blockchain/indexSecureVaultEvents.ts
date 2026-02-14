import { publicClient } from "./client.js";
import { secureVaultAbi } from "./secureVault.abi.js";
import { prisma } from "@prisma/client.js";

const VAULT_ADDRESS = process.env.VAULT_ADDRESS as `0x${string}` | undefined;

if (!VAULT_ADDRESS) {
    throw new Error("VAULT_ADDRESS is not defined in environment variables");
}

export const indexSecureVaultEvents = async (
    fromBlock: bigint,
    toBlock: bigint
) => {
    console.log(`Indexing SecureVault Events from block ${fromBlock}`);

    const logs = await publicClient.getLogs({
        address: VAULT_ADDRESS,
        events: secureVaultAbi,
        fromBlock,
        toBlock,
    });

    const blockCache = new Map<
        bigint,
        Awaited<ReturnType<typeof publicClient.getBlock>>
    >();

    for (const log of logs) {
        const { eventName, args, blockNumber, transactionHash } = log;

        if (!blockNumber || !transactionHash) continue;

        if (!blockCache.has(blockNumber)) {
            const block = await publicClient.getBlock({ blockNumber });
            blockCache.set(blockNumber, block);
        }

        const block = blockCache.get(blockNumber);

        const walletAddress = (args as any)?.user?.toLowerCase?.() ?? "unknown";

        const base = {
            walletAddress,
            txHash: transactionHash,
            blockNumber: Number(blockNumber),
            timestamp: new Date(Number(block?.timestamp) * 1000),
        };

        await prisma.vaultEvent.upsert({
            where: { txHash: transactionHash },
            update: {},
            create: {
                ...base,
                eventType: mapEventType(eventName),
                amount: extractAmount(eventName, args),
            },
        });

        console.log(`Index ${logs.length} events`);
    }

    function mapEventType(eventName: string): string {
        switch (eventName) {
            case "UserDeposited":
                return "DEPOSIT";
            case "UserRequestedWithdrawal":
                return "WITHDRAW_REQUEST";
            case "UserWithdrawn":
                return "WITHDRAW_EXECUTED";
            case "UserModifiedPendingWithdrawal":
                return "WITHDRAW_MODIFIED";
            case "UserCancelledPendingWithdrawal":
                return "WITHDRAW_CANCELLED";
            default:
                return "UNKNOWN";
        }
    }

    function extractAmount(eventName: string, args: any): string {
        switch (eventName) {
            case "UserDeposited":
            case "UserRequestedWithdrawal":
            case "UserWithdrawn":
                return args.amount.toString();
            case "UserModifiedPendingWithdrawal":
                return args.newAmount.toString();
            default:
                return "0";
        }
    }
};
