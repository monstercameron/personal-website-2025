import express from "express";
// Import controllers as needed
import websiteController from "./aiengine.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World");
});

// Add the /api/ask endpoint
router.get("/ask", websiteController);

export default router;
