import { Router } from "express";
import { requireAuth } from "@middlewares/auth.middlewares.js";
import {
    deposits,
    history,
    pendingWithdrawal,
    totalVolume,
    withdrawals,
} from "./vault.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/history", history);
router.get("/deposits", deposits);
router.get("/withdrawals", withdrawals);
router.get("/pendingWithdrawal", pendingWithdrawal);
router.get("/totalVolume", totalVolume);

export default router;
