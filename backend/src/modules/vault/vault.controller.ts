import { prisma } from "@prisma/client.js";
import { VaultRepository } from "./vault.repository.js";
import {
    getDeposits,
    getTotalVolume,
    getVaultHistory,
    getWithdrawal,
} from "./vault.service.js";
import { Request, Response } from "express";

const vaultRepo = new VaultRepository(prisma);

export const history = async (req: Request, res: Response) => {
    const walletAddress = req.user!.walletAddress;

    const data = await getVaultHistory(walletAddress, vaultRepo);

    return res.json(data);
};

export const deposits = async (req: Request, res: Response) => {
    const walletAddress = req.user!.walletAddress;

    const data = await getDeposits(walletAddress, vaultRepo);

    return res.json(data);
};

export const withdrawals = async (req: Request, res: Response) => {
    const walletAddress = req.user!.walletAddress;

    const data = await getWithdrawal(walletAddress, vaultRepo);

    return res.json(data);
};

export const totalVolume = async (req: Request, res: Response) => {
    const { walletAddress } = req.user!;

    const data = await getTotalVolume(walletAddress, vaultRepo);

    return res.json(data);
};
