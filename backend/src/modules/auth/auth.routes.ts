import { Router } from "express";
import { requestNonce } from "./auth.controller.js";

const router = Router();

router.post("/nonce", requestNonce);

export default router;
