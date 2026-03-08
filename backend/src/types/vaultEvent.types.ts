import Decimal from "decimal.js";

export type DecimalValue = InstanceType<typeof Decimal>;

// Describes data coming IN from the blockchain (write side)
export type VaultEventInput = {
    walletAddress: string;
    txHash: string;
    blockNumber: number;
    timestamp: Date;
    eventType: string;
    amount: string;
};

// Describes data coming OUT of the database (read side)
export type VaultEventRecord = {
    id: string;
    walletAddress: string;
    eventType: string;
    amount: DecimalValue | null;
    txHash: string;
    blockNumber: number;
    timestamp: Date;
};