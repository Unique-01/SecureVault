import { IVaultReader } from "./vault.interface.js";
import Decimal from "decimal.js";

class VaultService {
    constructor(private repo: IVaultReader) {}

    private async fetchEvents(wallet: string, type?: string) {
        return await this.repo.getEventsByWallet(wallet, type);
    }

    async getVaultHistory(walletAddress: string) {
        return this.fetchEvents(walletAddress);
    }

    async getDeposits(walletAddress: string) {
        return this.fetchEvents(walletAddress, "DEPOSIT");
    }

    async getWithdrawal(walletAddress: string) {
        return this.fetchEvents(walletAddress, "WITHDRAW_EXECUTED");
    }

    async getPendingWithdrawal(walletAddress: string) {
        return this.repo.getPendingWithdrawal(walletAddress);
    }

    async getTotalVolume(walletAddress: string) {
        return this.repo.getTotalVolume(walletAddress);
    }
}

export default VaultService;
