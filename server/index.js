require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const inviteRoutes = require("./routes/inviteRoutes");
const otpRoutes = require("./routes/otpRoutes");
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"));

app.use("/api/auth", authRoutes);
app.use("/api/invite", inviteRoutes);
app.use("/api/otp", otpRoutes);
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
