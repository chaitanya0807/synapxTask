require("dotenv").config();
const express = require("express");
const cors = require("cors");
const claimsRouter = require("./routes/claims");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use("/api", claimsRouter);

app.listen(process.env.PORT || 3001, () => console.log("Server running on port 3001"));
