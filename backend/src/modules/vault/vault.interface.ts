import type {
    VaultEventInput,
    VaultEventRecord,
} from "src/types/vaultEvent.types.js";

export interface IVaultWriter {
    saveVaultEvent(event: VaultEventInput): Promise<void>;
}

export interface IVaultReader {
    getEventsByWallet(
        wallet: string,
        eventType?: "DEPOSIT" | "WITHDRAWAL"
    ): Promise<VaultEventRecord[]>;
}
