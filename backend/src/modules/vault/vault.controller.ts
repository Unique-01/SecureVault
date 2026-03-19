import { prisma } from "@prisma/client.js";
import { VaultRepository } from "./vault.repository.js";
import {
    getDeposits,
    getPendingWithdrawal,
    getTotalVolume,
    getVaultHistory,
    getWithdrawal,
} from "./vault.service.js";
import { Request, Response } from "express";

const vaultRepo = new VaultRepository(prisma);

export const history = async (req: Request, res: Response) => {
    // #swagger.tags = ['Vault']
    // #swagger.summary = 'Full Transaction Audit Trail'
    // #swagger.description = 'Returns every on-chain event (Deposits, Requests, Modifications, Cancellations, Claims) sorted by date.'
    // #swagger.security = [{ "bearerAuth": [] }]
    /* #swagger.responses[200] = { 
            schema: [{ $ref: "#/definitions/VaultEvent" }] 
    } */
    const walletAddress = req.user!.walletAddress;

    const data = await getVaultHistory(walletAddress, vaultRepo);

    return res.json(data);
};

export const deposits = async (req: Request, res: Response) => {
    // #swagger.tags = ['Vault']
    // #swagger.summary = 'Get all deposit events'
    // #swagger.security = [{ "bearerAuth": [] }]
    /* #swagger.responses[200] = { 
            schema: [{ $ref: "#/definitions/VaultEvent" }] 
    } */
    const walletAddress = req.user!.walletAddress;

    const data = await getDeposits(walletAddress, vaultRepo);

    return res.json(data);
};

export const withdrawals = async (req: Request, res: Response) => {
    // #swagger.tags = ['Vault']
    // #swagger.summary = 'Get all successful claims'
    // #swagger.description = 'Only returns events where funds were successfully withdrawn from the vault after the 24h lock.'
    // #swagger.security = [{ "bearerAuth": [] }]
    /* #swagger.responses[200] = { 
            schema: [{ $ref: "#/definitions/VaultEvent" }]  
    } */
    const walletAddress = req.user!.walletAddress;

    const data = await getWithdrawal(walletAddress, vaultRepo);

    return res.json(data);
};

export const pendingWithdrawal = async (req: Request, res: Response) => {
    // #swagger.tags = ['Vault']
    // #swagger.summary = 'Active Pending Withdrawal'
    // #swagger.description = 'Checks the current state to see if the user has an active 24-hour lock period running.'
    // #swagger.security = [{ "bearerAuth": [] }]
    /* #swagger.responses[200] = { 
            schema: { $ref: "#/definitions/VaultEvent" },
            description: "Returns null if no withdrawal is currently pending."
    } */
    const walletAddress = req.user!.walletAddress;
    
    const data = await getPendingWithdrawal(walletAddress, vaultRepo);

    return res.json(data);
};

export const totalVolume = async (req: Request, res: Response) => {
    // #swagger.tags = ['Vault']
    // #swagger.summary = 'Total transaction volume'
    // #swagger.description = 'Calculates the total transaction volume for the user.'
    // #swagger.security = [{ "bearerAuth": [] }]
    /* #swagger.responses[200] = { 
            schema: { total: "1.5" } 
    } */
    const { walletAddress } = req.user!;

    const data = await getTotalVolume(walletAddress, vaultRepo);

    return res.json(data);
};
