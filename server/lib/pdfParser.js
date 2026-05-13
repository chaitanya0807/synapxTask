const { PDFParse } = require("pdf-parse");

async function extractText(fileBuffer, mimetype) {
  if (mimetype === "application/pdf") {
    try {
      const pdf = new PDFParse(new Uint8Array(fileBuffer), { verbosity: 0 });
      const result = await pdf.getText();
      return result.pages.map((p) => p.text).join("\n");
    } catch (err) {
      throw new Error("PDF parsing failed: " + err.message);
    }
  }
  if (mimetype === "text/plain") {
    return fileBuffer.toString("utf-8");
  }
  throw new Error("Unsupported file type. Upload PDF or TXT.");
}

module.exports = { extractText };
