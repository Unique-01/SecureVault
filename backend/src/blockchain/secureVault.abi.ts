export const secureVaultAbi = [
    {
        type: "event",
        name: "UserDeposited",
        inputs: [
            { name: "user", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false },
        ],
    },
    {
        type: "event",
        name: "UserRequestedWithdrawal",
        inputs: [
            { name: "user", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false },
            { name: "requestTime", type: "uint256", indexed: false },
        ],
    },
    {
        type: "event",
        name: "UserWithdrawn",
        inputs: [
            { name: "user", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false },
        ],
    },
    {
        type: "event",
        name: "UserModifiedPendingWithdrawal",
        inputs: [
            { name: "user", type: "address", indexed: true },
            { name: "previousAmount", type: "uint256", indexed: false },
            { name: "newAmount", type: "uint256", indexed: false },
        ],
    },
    {
        type: "event",
        name: "UserCancelledPendingWithdrawal",
        inputs: [{ name: "user", type: "address", indexed: true }],
    },
] as const;
