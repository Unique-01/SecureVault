import { Request, Response, NextFunction } from "express";
import { AppError } from "src/common/errors/AppError.js";

export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (err instanceof AppError) {
        return res
            .status(err.status)
            .json({ status: "error", message: err.message });
    }

    console.error(err); // log unexpected errors
    res.status(500).json({ error: "Internal Server Error" });
}
