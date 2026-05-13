const express = require("express");
const multer = require("multer");
const { extractText } = require("../lib/pdfParser");
const { extractClaimFields } = require("../lib/langchainChain");
const { routeClaim } = require("../lib/routingEngine");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.post("/process-claim", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const rawText = await extractText(req.file.buffer, req.file.mimetype);
    if (rawText.trim().length <= 50) {
      return res.status(400).json({ error: "Document appears to be empty or unreadable." });
    }
    const extractedFields = await extractClaimFields(rawText);
    const { recommendedRoute, reasoning, missingFields } = routeClaim(extractedFields);

    res.json({ extractedFields, missingFields, recommendedRoute, reasoning });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
