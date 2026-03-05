import { vaultRepository } from "./vault.repository.js";
import {
    getDeposits,
    getTotalVolume,
    getVaultHistory,
    getWithdrawal,
} from "./vault.service.js";
import { Request, Response } from "express";

export const history = async (req: Request, res: Response) => {
    const walletAddress = req.user!.walletAddress;

    const data = await getVaultHistory(walletAddress, vaultRepository);

    return res.json(data);
};

export const deposits = async (req: Request, res: Response) => {
    const walletAddress = req.user!.walletAddress;

    const data = await getDeposits(walletAddress, vaultRepository);

    return res.json(data);
};

export const withdrawals = async (req: Request, res: Response) => {
    const walletAddress = req.user!.walletAddress;

    const data = await getWithdrawal(walletAddress, vaultRepository);

    return res.json(data);
};

export const totalVolume = async (req: Request, res: Response) => {
    const { walletAddress } = req.user!;

    const data = await getTotalVolume(walletAddress, vaultRepository);

    return res.json(data);
};
