import { Request, Response } from "express";
import VaultService from "./vault.service.js";

class VaultController {
    constructor(private vaultService: VaultService) {}

    history = async (req: Request, res: Response) => {
        // #swagger.tags = ['Vault']
        // #swagger.summary = 'Full Transaction Audit Trail'
        // #swagger.description = 'Returns every on-chain event (Deposits, Requests, Modifications, Cancellations, Claims) sorted by date.'
        // #swagger.security = [{ "bearerAuth": [] }]
        /* #swagger.responses[200] = { 
                schema: [{ $ref: "#/definitions/VaultEvent" }] 
        } */
        const walletAddress = req.user!.walletAddress;

        const data = await this.vaultService.getVaultHistory(walletAddress);

        return res.json(data);
    };
    deposits = async (req: Request, res: Response) => {
        // #swagger.tags = ['Vault']
        // #swagger.summary = 'Get all deposit events'
        // #swagger.security = [{ "bearerAuth": [] }]
        /* #swagger.responses[200] = { 
                schema: [{ $ref: "#/definitions/VaultEvent" }] 
        } */
        const walletAddress = req.user!.walletAddress;

        const data = await this.vaultService.getDeposits(walletAddress);

        return res.json(data);
    };
    withdrawals = async (req: Request, res: Response) => {
        // #swagger.tags = ['Vault']
        // #swagger.summary = 'Get all successful claims'
        // #swagger.description = 'Only returns events where funds were successfully withdrawn from the vault after the 24h lock.'
        // #swagger.security = [{ "bearerAuth": [] }]
        /* #swagger.responses[200] = { 
                schema: [{ $ref: "#/definitions/VaultEvent" }]  
        } */
        const walletAddress = req.user!.walletAddress;

        const data = await this.vaultService.getWithdrawal(walletAddress);

        return res.json(data);
    };

    pendingWithdrawal = async (req: Request, res: Response) => {
        // #swagger.tags = ['Vault']
        // #swagger.summary = 'Active Pending Withdrawal'
        // #swagger.description = 'Checks the current state to see if the user has an active 24-hour lock period running.'
        // #swagger.security = [{ "bearerAuth": [] }]
        /* #swagger.responses[200] = { 
                schema: { $ref: "#/definitions/VaultEvent" },
                description: "Returns null if no withdrawal is currently pending."
        } */
        const walletAddress = req.user!.walletAddress;

        const data = await this.vaultService.getPendingWithdrawal(
            walletAddress
        );

        return res.json(data);
    };
    totalVolume = async (req: Request, res: Response) => {
        // #swagger.tags = ['Vault']
        // #swagger.summary = 'Total transaction volume'
        // #swagger.description = 'Calculates the total transaction volume for the user.'
        // #swagger.security = [{ "bearerAuth": [] }]
        /* #swagger.responses[200] = { 
                schema: { total: "1.5" } 
        } */
        const { walletAddress } = req.user!;

        const data = await this.vaultService.getTotalVolume(walletAddress);

        return res.json(data);
    };
}

export default VaultController;
