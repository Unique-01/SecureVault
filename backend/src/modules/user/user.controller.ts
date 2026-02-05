import { Request, Response } from "express";

export const getMe = (req: Request, res: Response) => {
    const user = req.user;
    return res.json({ user });
};
