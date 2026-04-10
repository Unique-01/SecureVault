import { Router } from "express";
import VaultController from "./vault.controller.js";
import { vaultService, tokenService } from "src/config/dependencies/index.js";
import authMiddleware from "@middlewares/auth.middlewares.js";

const router = Router();

const vaultController = new VaultController(vaultService);

router.use(authMiddleware(tokenService));

router.get("/history", vaultController.history);
router.get("/deposits", vaultController.deposits);
router.get("/withdrawals", vaultController.withdrawals);
router.get("/pendingWithdrawal", vaultController.pendingWithdrawal);
router.get("/totalVolume", vaultController.totalVolume);

export default router;
