import { AppError } from "src/common/errors/AppError.js";

export class InvalidTokenError extends AppError {
    constructor() {
        super(401, "Invalid token");
    }
}

export class ExpiredTokenError extends AppError {
    constructor() {
        super(401, "Token expired");
    }
}
