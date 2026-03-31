import { Router } from "express";
import { prisma } from "@prisma/client.js";
import { AuthRepository } from "./auth.repository.js";
import AuthService from "./auth.service.js";
import AuthController from "./auth.controller.js";
import { generateNonce } from "@utils/nonce.js";
import { signJwt } from "@utils/jwt.js";
import { recoverMessageAddress } from "viem";

const router = Router();

const authRepo = new AuthRepository(prisma);
const authService = new AuthService(
    authRepo,
    authRepo,
    generateNonce,
    recoverMessageAddress,
    signJwt
);
const authController = new AuthController(authService);

router.post("/nonce", authController.requestNonce);
router.post("/verify", authController.verifyNonce);

export default router;
