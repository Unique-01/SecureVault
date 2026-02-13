import { createPublicClient, http } from "viem";
import { mainnet, sepolia } from "viem/chains";

const chain = process.env.NODE_ENV === "production" ? mainnet : sepolia;

export const publicClient = createPublicClient({
    chain,
    transport: http(process.env.RPC_URL),
});
