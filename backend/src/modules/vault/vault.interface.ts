import Decimal from "decimal.js";

type DecimalValue = InstanceType<typeof Decimal>;

export interface VaultEventRecord {
    id: string;
    walletAddress: string;
    eventType: string;
    amount: DecimalValue | null;
    txHash: string;
    blockNumber: number;
    timestamp: Date;
}

export interface IVaultRepository {
    getEventsByWallet(
        wallet: string,
        eventType?: "DEPOSIT" | "WITHDRAWAL"
    ): Promise<VaultEventRecord[]>;
}
