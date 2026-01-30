// import { PrismaClient } from "@prisma/client";
import { PrismaClient } from "../generated/prisma/client.js";

export const prisma = new PrismaClient({ log: ["error", "query", "warn"] });
