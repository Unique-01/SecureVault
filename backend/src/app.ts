import express, { Request, Response } from "express";
import authRoutes from "@modules/auth/auth.routes.js";
import userRoutes from "@modules/user/user.routes.js";

const app = express();

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
});

export default app;
