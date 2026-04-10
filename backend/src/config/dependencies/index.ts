// General Imports
import { prisma } from "@prisma/client.js";
import JwtService from "src/common/token/services/jwt.service.js";
import dotenv from "dotenv";

// Auth module imports
import AuthService from "@modules/auth/auth.service.js";
import NonceService from "@modules/auth/nonce/nonce.service.js";
import PrismaNonceRepository from "@modules/auth/nonce/nonce.repository.js";
import { EvmSignatureService } from "@modules/auth/signature/signature.service.js";
import UserRepository from "@modules/auth/user/user.repository.js";

// Vault module imports
import { VaultRepository } from "@modules/vault/vault.repository.js";
import VaultService from "@modules/vault/vault.service.js";

dotenv.config();

// General Variables
const db = prisma;
const tokenService = new JwtService(
    process.env.JWT_SECRET!,
    process.env.JWT_EXPIRES_IN || "7d"
);

// Auth Dependency Variables
const nonceRepo = new PrismaNonceRepository(db);
const nonceService = new NonceService(nonceRepo);
const signatureService = new EvmSignatureService();
const userService = new UserRepository(db);
const authService = new AuthService(
    nonceService,
    signatureService,
    userService,
    tokenService
);

// Vault Dependency Variables
const vaultRepo = new VaultRepository(db);
const vaultService = new VaultService(vaultRepo);

export { tokenService, authService, vaultService };
