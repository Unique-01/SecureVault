import { Router } from "express";
import { requireAuth } from "@middlewares/auth.middlewares.js";
import VaultController from "./vault.controller.js";
import { VaultRepository } from "./vault.repository.js";
import { prisma } from "@prisma/client.js";
import VaultService from "./vault.service.js";

const router = Router();

router.use(requireAuth);

const vaultRepo = new VaultRepository(prisma);
const vaultService = new VaultService(vaultRepo);
const vaultController = new VaultController(vaultService);

router.get("/history", vaultController.history);
router.get("/deposits", vaultController.deposits);
router.get("/withdrawals", vaultController.withdrawals);
router.get("/pendingWithdrawal", vaultController.pendingWithdrawal);
router.get("/totalVolume", vaultController.totalVolume);

export default router;
