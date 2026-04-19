import { ITokenService, TokenPayload } from "../interface/token.interface.js";
import jwt from "jsonwebtoken";
import { InvalidTokenError, ExpiredTokenError } from "../errors/tokenErrors.js";
import { SignOptions } from "jsonwebtoken";

const { TokenExpiredError, JsonWebTokenError } = jwt;

class JwtService implements ITokenService {
    constructor(
        private readonly secret: string,
        private readonly expiresIn: SignOptions["expiresIn"]
    ) {
        if (!secret) {
            throw new Error("JWT_SECRET is not defined");
        }
    }

    async sign(payload: TokenPayload): Promise<string> {
        return jwt.sign(payload, this.secret, {
            expiresIn: this.expiresIn,
        });
    }

    async verify(token: string): Promise<TokenPayload> {
        try {
            const decoded = jwt.verify(token, this.secret) as TokenPayload;

            if (typeof decoded == "string") {
                throw new InvalidTokenError();
            }
            return decoded as TokenPayload;
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
