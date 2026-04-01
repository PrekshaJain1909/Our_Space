require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const inviteRoutes = require("./routes/inviteRoutes");
const otpRoutes = require("./routes/otpRoutes");
const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Avoid silently buffering queries when DB is unavailable.
mongoose.set("bufferCommands", false);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/invite", inviteRoutes);
app.use("/api/otp", otpRoutes);

async function startServer() {
  try {
    if (!MONGO_URI) {
      throw new Error("Missing MONGO_URI/MONGODB_URI in server/.env");
    }

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 12000
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error("Set a reachable MONGO_URI in server/.env (Atlas or local MongoDB).");
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on("error", (error) => {
    if (error && error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the existing server process and retry.`);
      process.exit(1);
    }

    throw error;
  });
}

startServer();
