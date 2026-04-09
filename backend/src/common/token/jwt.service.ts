import { ITokenService, TokenPayload } from "./token.interface.js";
import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { InvalidTokenError, ExpiredTokenError } from "./errors/tokenErrors.js";

class JwtService implements ITokenService {
    constructor(
        private readonly secret: string,
        private readonly expiresIn: string
    ) {
        if (!secret) {
            throw new Error("JWT_SECRET is not defined");
        }
    }

    async sign(payload: TokenPayload): Promise<string> {
        return jwt.sign(payload, this.secret, {
            expiresIn: this.expiresIn as any,
        });
    }

    async verify(token: string): Promise<TokenPayload> {
        try {
            return jwt.verify(token, this.secret) as TokenPayload;
        } catch (err) {
            if (err instanceof TokenExpiredError) {
                throw new ExpiredTokenError();
            }

            if (err instanceof JsonWebTokenError) {
                throw new InvalidTokenError();
            }

            throw new InvalidTokenError();
        }
    }
}

export default JwtService;
