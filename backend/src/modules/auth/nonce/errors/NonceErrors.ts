import { AppError } from "src/common/errors/AppError.js";

export class NonceNotFoundError extends AppError {
    constructor() {
        super(404, "Nonce not found. Request a new one");
    }
}

export class NonceIsExpiredError extends AppError {
    constructor() {
        super(400, "Nonce is expired. Request a new one");
    }
}
