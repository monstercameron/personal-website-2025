import dotenv from "dotenv";
import app from "./src/server.js";

dotenv.config();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
