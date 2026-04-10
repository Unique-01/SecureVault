import { Request, Response, NextFunction } from "express";
import {
    ITokenService,
    TokenPayload,
} from "src/common/token/interface/token.interface.js";
import { InvalidTokenError } from "src/common/token/errors/tokenErrors.js";

const authMiddleware =
    (tokenService: ITokenService) =>
    async (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new InvalidTokenError();
        }

        const token = authHeader.split(" ")[1];

        const payload: TokenPayload = await tokenService.verify(token);

        req.user = payload;

        next();
    };

export default authMiddleware;
