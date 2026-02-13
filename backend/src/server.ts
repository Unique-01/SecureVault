import app from "./app.js";
import dotenv from "dotenv";
import { startIndexer } from "blockchain/bootstrap.js";

dotenv.config();

startIndexer().catch(console.error);

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
