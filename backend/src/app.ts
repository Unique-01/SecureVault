import express, { Request, Response } from "express";
import authRoutes from "@modules/auth/auth.routes.js";

const app = express();

app.use(express.json());
app.use("/auth", authRoutes);

app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
});

export default app;
