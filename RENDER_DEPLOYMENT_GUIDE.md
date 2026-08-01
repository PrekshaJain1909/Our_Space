# Render Backend Deployment Guide

## Problem: HTTP 500 and 404 Errors

Your deployed backend is missing critical environment variables. The server may start but crashes on the first request when it tries to connect to MongoDB or send emails.

## Solution: Set Environment Variables on Render

### Step 1: Go to Render Dashboard
1. Log in to https://render.com
2. Find your service "our-love-space" (or similar name)
3. Click **Settings** → **Environment**

### Step 2: Add These Variables

| Variable | Value | Where to Get It |
|----------|-------|-----------------|
| `MONGO_URI` | Your MongoDB connection string | See **MongoDB Setup** below |
| `JWT_SECRET` | Any random string (min 32 chars) | Generate one: `openssl rand -base64 32` |
| `EMAIL_USER` | Your Gmail address | Your Gmail email |
| `EMAIL_PASS` | Gmail app password (NOT regular password) | See **Gmail Setup** below |
| `FRONTEND_URL` | Your Vercel frontend URL | `https://our-space-pi.vercel.app` |
| `FRONTEND_URLS` | (Optional) Comma-separated preview URLs | `https://our-space-pi-preview.vercel.app` |
| `NODE_ENV` | `production` | (Improves error messages) |

## MongoDB Setup

### Option A: MongoDB Atlas (Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (pick your region)
4. Click **Connect** → **Drivers** → **Node.js**
5. Copy the connection string (looks like `mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority`)
6. Replace `<password>` with your database password
7. Paste as `MONGO_URI` in Render

### Option B: Local MongoDB (Not for Production)
- Not recommended for deployed backend
- Only works if you're running it locally

## Gmail Setup (For OTP Emails)

### 1. Enable 2FA on Your Gmail Account
- Go to https://myaccount.google.com/security
- Enable 2-Step Verification

### 2. Generate App Password
- Go to https://myaccount.google.com/apppasswords
- Select **Mail** and **Windows Computer** (or your device)
- Google will generate a 16-character password like: `abcd efgh ijkl mnop`
- Copy this (remove spaces): `abcdefghijklmnop`

### 3. Set Environment Variables
- `EMAIL_USER` = your Gmail address (e.g., `youremail@gmail.com`)
- `EMAIL_PASS` = the 16-character app password (e.g., `abcdefghijklmnop`)

## JWT Secret Setup

Generate a random 32-character string:

```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Or use an online generator:
# https://www.random.org/strings/?num=1&len=32&digits=on&loweralpha=on&upperalpha=on&unique=on&format=html
```

Then set `JWT_SECRET` to that value in Render.

## After Setting Variables

1. **Redeploy** the backend on Render (it will redeploy automatically or you can manually trigger it)
2. **Check logs** to verify MongoDB connection succeeded:
   - Click **Logs** in Render
   - Look for: `✓ MongoDB Connected`
   - If you see connection errors, double-check the `MONGO_URI` value

3. **Test the register endpoint**:
   ```bash
   curl -X POST https://our-love-space.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "coupleName": "Test Couple",
       "name": "John",
       "email": "john@example.com",
       "password": "testpass123"
     }'
   ```

   - **Expected**: 201 status with OTP sent
   - **If 500**: MongoDB or email still not connected (check logs)
   - **If 404**: Something else is wrong (check server logs)

## Troubleshooting

### Error: "Cannot connect to MongoDB"
- Check `MONGO_URI` is set and correct
- If using MongoDB Atlas, check IP whitelist includes Render (usually set to 0.0.0.0/0 for free tier)
- Make sure the database credentials are right (replace `<password>` in connection string)

### Error: "Email service not configured"
- Check `EMAIL_USER` is set
- Check `EMAIL_PASS` is set (should be app password, not regular Gmail password)
- Make sure you enabled 2FA on the Gmail account first

### Error: "JWT_SECRET not set"
- Not critical for registration, but set it anyway for security

### Error: "500 Internal Server Error" with no specific message
- Check Render **Logs** for the actual error
- Scroll up to see what failed

## Frontend Configuration

Make sure your frontend has `VITE_API_BASE_URL` set to your Render backend:

### On Vercel Dashboard:
1. Go to your project settings
2. **Environment Variables**
3. Add:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://our-love-space.onrender.com/api`
4. Redeploy the frontend

Then your app will use the deployed backend instead of localhost.

## Verify Everything Works

1. Frontend deployed on Vercel: https://our-space-pi.vercel.app
2. Backend deployed on Render: https://our-love-space.onrender.com
3. Register → OTP email arrives → Verify OTP → Login succeeds ✓

If you still see 500 or 404 errors, check the Render **Logs** and share the actual error message.
