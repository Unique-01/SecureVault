import { Router } from "express";
import { requestNonce, verifyNonce } from "./auth.controller.js";

const router = Router();

router.post("/nonce", requestNonce);
router.post("/verify", verifyNonce);

export default router;
