import jwt, { Secret } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as Secret;

if (!JWT_SECRET) {
    throw new Error(
        "FATAL ERROR: JWT_SECRET is not defined in environment variables."
    );
}

export function signJwt(payload: object, expiresIn = "7d") {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyJwt(token: string) {
    return jwt.verify(token, JWT_SECRET);
}
