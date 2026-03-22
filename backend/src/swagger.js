import swaggerAutogen from "swagger-autogen";
import dotenv from "dotenv"

dotenv.config()

const isProduction = process.env.NODE_ENV === "production";

const doc = {
    info: {
        title: "SecureVault API",
        description: "Infrastructure for Financial Security",
        version: "1.0.0",
    },
    host: process.env.API_HOST || "localhost:8000",
    schemes: [isProduction ? "https" : "http"],
    securityDefinitions: {
        bearerAuth: {
            type: "apiKey",
            in: "header",
            name: "Authorization",
        },
    },
    definitions: {
        VaultEvent: {
            id: "uuid-string-1234",
            walletAddress: "0x123...abc",
            eventType: "DEPOSIT",
            amount: "1.5",
            txHash: "0xabcdef...",
            blockNumber: 19482031,
            timestamp: "2024-03-18T12:00:00Z",
        },
        AuthNonceResponse: {
            message:
                "Sign this message to login to SecureVault:\nWallet: 0x123\nNonce: dgjhsjsdsd\nExpires At: 2024-01-01T00:00:00.000Z",
        },
        AuthVerifyResponse: {
            token: "eyJhbGciOiJIUzI1...",
        },
    },
};

const outputFile = "./swagger-output.json";
const routes = ["./app.ts"];

swaggerAutogen()(outputFile, routes, doc);
