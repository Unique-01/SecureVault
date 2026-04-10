import { Router } from "express";
import AuthController from "./auth.controller.js";
import { authService } from "src/config/dependencies/index.js";

const router = Router();

const authController = new AuthController(authService);

router.post("/nonce", authController.requestNonce);
router.post("/verify", authController.verifyNonce);

export default router;
