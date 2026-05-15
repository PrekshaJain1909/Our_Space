require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const inviteRoutes = require("./routes/inviteRoutes");
const otpRoutes = require("./routes/otpRoutes");
const { verifyTransporter } = require("./service/mailService");
const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Avoid silently buffering queries when DB is unavailable.
mongoose.set("bufferCommands", false);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/invite", inviteRoutes);
app.use("/api/otp", otpRoutes);

// Register global error handler (must come after route definitions)
const { errorHandler } = require("./middleware/errorMiddleware");
app.use(errorHandler);

// Validate required environment variables
function validateEnv() {
  const required = ['MONGO_URI', 'MONGODB_URI', 'JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
  const missing = required.filter(v => !process.env[v]);
  
  if (missing.includes('MONGO_URI') && missing.includes('MONGODB_URI')) {
    console.error('❌ ERROR: Neither MONGO_URI nor MONGODB_URI is set');
    console.error('   Set one of these in your Render environment variables');
    process.exit(1);
  }
  
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  WARNING: JWT_SECRET not set. Set it in your Render environment variables');
  }
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  WARNING: EMAIL_USER or EMAIL_PASS not set. Email OTP will fail');
    console.warn('   Set EMAIL_USER and EMAIL_PASS in your Render environment variables');
  }
  
  console.log('✓ Starting server with:');
  console.log(`  PORT: ${PORT}`);
  console.log(`  MongoDB: ${MONGO_URI ? MONGO_URI.split('@')[0] + '***' : 'NOT SET'}`);
  console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? '***' : 'NOT SET'}`);
  console.log(`  Email: ${process.env.EMAIL_USER ? process.env.EMAIL_USER : 'NOT SET'}`);
}

async function startServer() {
  try {
    validateEnv();
    
    if (!MONGO_URI) {
      throw new Error("Missing MONGO_URI/MONGODB_URI in server/.env");
    }

    console.log('\n🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 12000,
      connectTimeoutMS: 10000
    });
    console.log("✓ MongoDB Connected\n");

    // Verify email service after MongoDB
    console.log('🔄 Verifying email service...');
    const emailReady = await verifyTransporter();
    if (!emailReady) {
      console.warn("⚠️  Email service verification failed. OTP emails will not work.");
      console.warn("    Check EMAIL_USER, EMAIL_PASS, and EMAIL_PROVIDER environment variables.\n");
    } else {
      console.log("✓ Email service ready\n");
    }
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("\n📋 Next steps:");
    console.error("   1. Get your MongoDB Atlas connection string from: https://www.mongodb.com/cloud/atlas");
    console.error("   2. Set MONGO_URI environment variable on Render");
    console.error("   3. Redeploy the backend\n");
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`   API: https://our-love-space.onrender.com`);
    console.log(`   Frontend: ${allowedOrigins.join(', ')}\n`);
  });

  server.on("error", (error) => {
    if (error && error.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use.`);
      process.exit(1);
    }
    throw error;
  });
}

startServer();
