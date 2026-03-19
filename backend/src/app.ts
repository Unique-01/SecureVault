import express, { Request, Response } from "express";
import authRoutes from "@modules/auth/auth.routes.js";
import userRoutes from "@modules/user/user.routes.js";
import vaultRoutes from "@modules/vault/vault.routes.js";
import systemStatusRoute from "./systemStatus.routes.js";
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";

const swaggerDocument = JSON.parse(
    fs.readFileSync(path.resolve("./src/swagger-output.json"), "utf8")
);

const app = express();

app.use(express.json());

app.use("/systemStatus", systemStatusRoute);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/vault", vaultRoutes);

export default app;
