import { IVaultReader } from "./vault.interface.js";
import Decimal from "decimal.js";

export const getVaultHistory = async (
    walletAddress: string,
    repo: IVaultReader
) => {
    return await repo.getEventsByWallet(walletAddress);
};

export const getDeposits = async (
    walletAddress: string,
    repo: IVaultReader
) => {
    return await repo.getEventsByWallet(walletAddress, "DEPOSIT");
};

export const getWithdrawal = async (
    walletAddress: string,
    repo: IVaultReader
) => {
    return await repo.getEventsByWallet(walletAddress, "WITHDRAWAL");
};

export const getTotalVolume = async (
    walletAddress: string,
    repo: IVaultReader
) => {
    const events = await repo.getEventsByWallet(walletAddress);

    const total = events.reduce((acc, event) => {
        return event.amount ? acc.plus(event.amount) : acc;
    }, new Decimal(0));

    return total.toFixed(2);
};
