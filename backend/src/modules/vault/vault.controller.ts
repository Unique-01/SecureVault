import {
    getDeposits,
    getVaultHistory,
    getWithdrawal,
} from "./vault.service.js";
import { Request, Response } from "express";

export const history = async (req: Request, res: Response) => {
    const walletAddress = req.user!.walletAddress;

    const data = await getVaultHistory(walletAddress);

    return res.json(data);
};

export const deposits = async (req: Request, res: Response) => {
    const walletAddress = req.user!.walletAddress;

    const data = await getDeposits(walletAddress);

    return res.json(data);
};

export const withdrawals = async (req: Request, res: Response) => {
    const walletAddress = req.user!.walletAddress;

    const data = await getWithdrawal(walletAddress);

    return res.json(data);
};
