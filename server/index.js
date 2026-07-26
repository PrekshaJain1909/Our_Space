require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const compression = require("compression");
const http = require('http');
let IOServer = null;
try {
  IOServer = require('socket.io').Server;
} catch (e) {
  console.warn('socket.io not installed; real-time features disabled');
}

const authRoutes = require("./routes/authRoutes");
const inviteRoutes = require("./routes/inviteRoutes");
const otpRoutes = require("./routes/otpRoutes");
const loveNotesRoutes = require("./routes/loveNotesRoutes");
const healingRoutes = require("./routes/healingRoutes");
const forgivenessRoutes = require("./routes/forgivenessRoutes");
const punishmentRoutes = require("./routes/punishmentRoutes");
const statsRoutes = require("./routes/statsRoutes");
const tasksRoutes = require("./routes/tasksRoutes");
const coupleRoutes = require("./routes/coupleRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const bucketRoutes = require("./routes/bucketRoutes");
const memoryRoutes = require("./routes/memoryRoutes");
const { verifyTransporter } = require("./service/mailService");
const { cleanupExpiredDeletedMemories } = require("./services/memoryService");
const tokenService = require('./service/tokenService');
const User = require('./models/User');
const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Avoid silently buffering queries when DB is unavailable.
mongoose.set("bufferCommands", false);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
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

app.use(compression());
app.use((req, res, next) => {
  if (req.method === "GET" && req.path.startsWith("/api/memories")) {
    res.set("Cache-Control", "private, max-age=15, stale-while-revalidate=60");
  }
  next();
});

app.use(express.json());

console.log('[server] allowed CORS origins:', allowedOrigins.join(', '));

app.use("/api/auth", authRoutes);
app.use("/api/invite", inviteRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/love-notes", loveNotesRoutes);
app.use("/api/healing", healingRoutes);
app.use("/api/forgiveness", forgivenessRoutes);
app.use("/api/punishments", punishmentRoutes);
app.use("/api/healing/stats", statsRoutes);
app.use("/api/couple", coupleRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/bucket", bucketRoutes);
app.use("/api/memories", memoryRoutes);
// New tasks endpoints (shared todo-like Healing tasks)
app.use("/api/healing/tasks", tasksRoutes);

// Register global error handler (must come after route definitions)
const { errorHandler } = require("./middleware/errorMiddleware");
app.use(errorHandler);

// Validate required environment variables
function validateEnv() {
  const required = ['MONGO_URI', 'MONGODB_URI', 'JWT_SECRET', 'BREVO_API_KEY'];
  const missing = required.filter(v => !process.env[v]);

  if (missing.includes('MONGO_URI') && missing.includes('MONGODB_URI')) {
    console.error('❌ ERROR: Neither MONGO_URI nor MONGODB_URI is set');
    console.error('   Set one of these in your Render environment variables');
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  WARNING: JWT_SECRET not set. Set it in your Render environment variables');
  }

  if (!process.env.BREVO_API_KEY) {
    console.warn('⚠️  WARNING: BREVO_API_KEY not set. Email OTP will fail');
    console.warn('   Set BREVO_API_KEY in your Render environment variables');
  }

  console.log('✓ Starting server with:');
  console.log(`  PORT: ${PORT}`);
  console.log(`  MongoDB: ${MONGO_URI ? MONGO_URI.split('@')[0] + '***' : 'NOT SET'}`);
  console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? '***' : 'NOT SET'}`);
  console.log(`  Brevo API Key: ${process.env.BREVO_API_KEY ? '***' : 'NOT SET'}`);
}

async function startServer() {
  try {
    validateEnv();

    if (!MONGO_URI) {
      throw new Error("Missing MONGO_URI/MONGODB_URI in server/.env");
    }

    console.log('\n🔄 Connecting to MongoDB...');
    console.log(process.env.MONGO_URI);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 12000,
      connectTimeoutMS: 10000
    });
    console.log("✓ MongoDB Connected\n");

    await cleanupExpiredDeletedMemories();
    setInterval(() => {
      cleanupExpiredDeletedMemories().catch((error) => console.warn("Cleanup failed:", error.message));
    }, 60 * 60 * 1000);

    // Verify email service after MongoDB
    console.log('🔄 Verifying email service...');
    const emailReady = await verifyTransporter();
    if (!emailReady) {
      console.warn("⚠️  Email service verification failed. OTP emails will not work.");
      console.warn("    Check BREVO_API_KEY environment variable.\n");
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

  // Create HTTP server and attach Socket.IO (optional)
  const server = http.createServer(app);
  if (IOServer) {
    const io = new IOServer(server, {
      cors: { origin: allowedOrigins, methods: ['GET', 'POST'] }
    });

    // Authenticate socket connections using JWT passed in `handshake.auth.token`
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake?.auth?.token || socket.handshake?.headers?.authorization?.split(' ')[1];
        if (!token) {
          console.warn('[socket] missing token in handshake for socket', socket.id);
          return next(new Error('Authentication error'));
        }

        const payload = tokenService.verifyAuthToken(token);
        if (!payload || !payload.userId) {
          console.warn('[socket] invalid token payload', payload);
          return next(new Error('Authentication error'));
        }

        // Attach minimal user info to socket for downstream handlers
        const user = await User.findById(payload.userId).select('name email coupleId');
        if (!user) return next(new Error('Authentication error'));
        socket.user = user;
        return next();
      } catch (err) {
        console.warn('[socket] auth failure', err && err.message);
        return next(new Error('Authentication error'));
      }
    });

    // Attach io instance to the app for controllers to use
    app.set('io', io);

    io.on('connection', (socket) => {
      console.log('[socket] client connected', socket.id);

      socket.on('join', ({ coupleId }) => {
        if (coupleId) {
          const room = `couple:${coupleId}`;
          socket.join(room);
          console.log(`[socket] ${socket.id} joined ${room}`);
        }
      });

      socket.on('leave', ({ coupleId }) => {
        if (coupleId) socket.leave(`couple:${coupleId}`);
      });

      socket.on('disconnect', () => {
        console.log('[socket] client disconnected', socket.id);
      });
    });
  } else {
    console.log('⚠️ Socket.IO not available; running without real-time updates');
  }

  server.listen(PORT, () => {
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
