import { createLoginMessage } from "../utils/message.js";

console.log(
    createLoginMessage(
      "0xAbC123456789...",
      "7f8d3a9c1b",
      new Date(Date.now() + 5 * 60_000).toISOString()
    )
  );