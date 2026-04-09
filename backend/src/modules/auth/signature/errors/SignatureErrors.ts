import { AppError } from "src/common/errors/AppError.js";

export class InvalidSignatureError extends AppError {
    constructor() {
        super(400, "Invalid Signature");
    }
}
