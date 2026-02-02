const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { generateToken, hashPassword, comparePassword } = require('../utils/auth');
const {generateResetToken} = require("../utils/resetToken");
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    // Support registering with a couple `name` only.
    const { name, password, femaleName, maleName } = req.body || {};
    // require a name (couple identifier) and password
    if (!name || !password) return res.status(400).json({ message: 'name and password required' });

    const users = await db.all('users');
    const existing = (users || []).find((u) => {
      if (name && u.name) return u.name.toLowerCase() === (name || '').toLowerCase();
      return false;
    });
    if (existing) return res.status(409).json({ message: 'User already exists' });

    const hashed = await hashPassword(password);
    const user = {
      id: uuidv4(),
      name: name || '',
      password: hashed,
      createdAt: Date.now(),
      // Save femaleName and maleName if provided
      ...(femaleName ? { femaleName } : {}),
      ...(maleName ? { maleName } : {}),
    };
    await db.create('users', user);
    const token = generateToken({ id: user.id, name: user.name });
    res.json({ user: { id: user.id, name: user.name, femaleName: user.femaleName, maleName: user.maleName }, token });
  } catch (e) {
    console.error('Registration error', e && e.message ? e.message : e);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    // Allow login with name (couple name) only
    const { name, password } = req.body || {};
    if (!name || !password) return res.status(400).json({ message: 'name and password required' });

    const users = await db.all('users');
    const user = (users || []).find((u) => {
      if (name && u.name) return u.name.toLowerCase() === (name || '').toLowerCase();
      return false;
    });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = generateToken({ id: user.id, name: user.name });
    // Return all user fields needed by frontend
    res.json({
      user: {
        id: user.id,
        name: user.name,
        femaleName: user.femaleName,
        maleName: user.maleName
      },
      token
    });
  } catch (e) {
    console.error('Login error', e && e.message ? e.message : e);
    res.status(500).json({ message: 'Login failed' });
  }
});

const requireAuth = require("../middleware/auth");

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const users = await db.all("users");
    const user = (users || []).find(
      (u) => u.name && u.name.toLowerCase() === name.toLowerCase()
    );

    // Do not reveal if user exists
    if (!user) {
      return res.json({
        message: "If the account exists, a reset token was generated",
      });
    }

    const { token, expires } = generateResetToken();

    await db.update("users", user.id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });

    res.json({
      message: "Reset token generated",
      resetToken: token,
      expiresAt: expires,
    });
  } catch (e) {
    console.error("Forgot password error", e);
    res.status(500).json({ message: "Failed to generate reset token" });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "token and password required" });
    }

    const users = await db.all("users");
    const user = (users || []).find(
      (u) =>
        u.resetPasswordToken === token &&
        u.resetPasswordExpires &&
        u.resetPasswordExpires > Date.now()
    );

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashed = await hashPassword(password);

    await db.update("users", user.id, {
      password: hashed,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    res.json({ message: "Password reset successful" });
  } catch (e) {
    console.error("Reset password error", e);
    res.status(500).json({ message: "Password reset failed" });
  }
});




// Get me
router.get('/me', requireAuth, (req, res) => {
  // req.user is set by requireAuth middleware
  res.json({ user: req.user });
});

module.exports = router;
