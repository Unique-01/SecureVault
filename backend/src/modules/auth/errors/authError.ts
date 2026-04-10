import { AppError } from "src/common/errors/AppError.js";

export class WalletRequiredError extends AppError {
    constructor() {
        super(400, "Wallet Address is required");
    }
}

export class WalletAndSignatureRequiredError extends AppError {
    constructor() {
        super(400, "Wallet address and signature are required");
    }
}
