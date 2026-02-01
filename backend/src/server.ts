import app from "./app.js";
import dotenv from "dotenv"

dotenv.config()

const PORT = 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
