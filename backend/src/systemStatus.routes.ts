// src/routes/health.routes.ts
import { Router } from "express";
import { systemStatusController } from "./systemStatus.controller.js";
import { IndexerStateRepository } from "./blockchain/indexerState.repository.js";
import { prisma } from "@prisma/client.js";
import { publicClient } from "./blockchain/client.js";

const router = Router();

router.get(
    "/",
    systemStatusController(new IndexerStateRepository(prisma), publicClient)
);

export default router;
