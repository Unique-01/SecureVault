export function mapEventType(eventName: string): string {
    switch (eventName) {
        case "UserDeposited":
            return "DEPOSIT";
        case "UserRequestedWithdrawal":
            return "WITHDRAW_REQUEST";
        case "UserWithdrawn":
            return "WITHDRAW_EXECUTED";
        case "UserModifiedPendingWithdrawal":
            return "WITHDRAW_MODIFIED";
        case "UserCancelledPendingWithdrawal":
            return "WITHDRAW_CANCELLED";
        default:
            return "UNKNOWN";
    }
}

export function extractAmount(eventName: string, args: any): string {
    switch (eventName) {
        case "UserDeposited":
        case "UserRequestedWithdrawal":
        case "UserWithdrawn":
            return args.amount.toString();
        case "UserModifiedPendingWithdrawal":
            return args.newAmount.toString();
        default:
            return "0";
    }
}
