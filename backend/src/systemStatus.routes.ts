import { Router } from "express";
import { systemStatusController } from "./systemStatus.controller.js";
import { IndexerStateRepository } from "./blockchain/indexerState.repository.js";
import { prisma } from "@prisma/client.js";
import { publicClient } from "./blockchain/client.js";
import { poller } from "./blockchain/bootstrap.js";

const router = Router();

const indexerStateRepo = new IndexerStateRepository(prisma);

router.get("/", systemStatusController(indexerStateRepo, publicClient, poller));

export default router;
