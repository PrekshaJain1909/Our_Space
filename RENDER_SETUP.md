# Render Deployment Setup Guide

## Email Configuration on Render

The backend now supports multiple email providers and has production-ready Nodemailer configuration optimized for Render.

### Quick Setup (Gmail - Recommended)

1. **Get a Gmail App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or other device type)
   - Copy the generated 16-character password

2. **Set Render Environment Variables**
   - Go to your Render service → Environment
   - Add these variables:
     ```
     EMAIL_PROVIDER=gmail
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASS=xxxx xxxx xxxx xxxx  (paste the 16-char password)
     EMAIL_FROM=your-email@gmail.com  (optional, defaults to EMAIL_USER)
     ```

3. **Deploy**
   - Push your changes: `git push origin main`
   - Render will automatically redeploy
   - Check logs for `✅ Email service ready`

---

## Alternative Email Providers

### Brevo (Formerly Sendinblue) - Most Reliable on Render

**Why Brevo?**
- More reliable SMTP on Render (avoids Gmail's port/IPv6 restrictions)
- Better rate limits for production
- No app-specific password needed

**Setup:**
1. Go to https://brevo.com → Create account
2. Go to SMTP & API → SMTP tab
3. Enable SMTP and copy the password
4. Set Render environment variables:
   ```
   EMAIL_PROVIDER=brevo
   EMAIL_USER=your-email@brevo.com  (or your email)
   EMAIL_PASS=your-brevo-smtp-key
   EMAIL_FROM=your-brevo-verified-email
   ```

### Resend (Best for Serverless/Render)

**Why Resend?**
- Specifically optimized for serverless environments
- Simplest setup
- Free tier available

**Setup:**
1. Go to https://resend.com → Create account
2. Copy your API key from dashboard
3. Set Render environment variables:
   ```
   EMAIL_PROVIDER=resend
   EMAIL_USER=resend  (literal value, do not change)
   EMAIL_PASS=re_xxxxxxxxx  (your Resend API key)
   EMAIL_FROM=onboarding@resend.dev  (use this for testing first)
   ```

### Custom SMTP

For any other SMTP provider:
```
EMAIL_PROVIDER=custom
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-smtp-password
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false  (use "true" only for port 465)
EMAIL_FROM=your-verified-email@domain.com
```

---

## Troubleshooting

### "Connection timeout" Error

**Cause:** IPv6 or firewall blocking
**Solution:** Already fixed in the new mailService.js (forces IPv4)

If still failing:
- Check that the SMTP port isn't blocked by Render's firewall
- Try a different email provider (Brevo/Resend recommended)
- Check EMAIL_USER and EMAIL_PASS are correct

### "Invalid login" Error

**Cause:** Wrong password or credentials
**Solution:**
- For Gmail: Ensure you're using an **app-specific password**, not your regular Gmail password
- For Brevo: Copy the SMTP key (not your account password)
- For Resend: Use your full API key

### OTP Emails Not Received

1. Check Render logs: Should see `✅ Email sent to user@email.com`
2. If no log, email sending failed (check error above)
3. Check spam/promotions folder
4. Try sending test email from your email provider's dashboard

---

## Environment Variables Summary

### Required
- `MONGO_URI` or `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `EMAIL_USER` - Email address or username
- `EMAIL_PASS` - Email password or app key
- `EMAIL_PROVIDER` - Provider: `gmail`, `brevo`, `resend`, or `custom`

### Optional
- `EMAIL_FROM` - Display email (defaults to EMAIL_USER)
- `FRONTEND_URL` - Frontend origin for CORS
- `FRONTEND_URLS` - Comma-separated list of additional frontend origins
- `SMTP_HOST` - For custom SMTP provider
- `SMTP_PORT` - For custom SMTP provider (default: 587)
- `SMTP_SECURE` - For custom SMTP provider (default: false)

---

## Production Checklist

- [ ] Email provider configured and verified
- [ ] All environment variables set on Render
- [ ] Test OTP email by registering a test account
- [ ] Check Render logs for `✓ Email service ready`
- [ ] Verify emails are being received (check spam folder)
- [ ] Set MongoDB backups if needed
- [ ] Enable Render's auto-deploy on git push

---

## Local Development

For local testing, create a `.env` file in `/server`:

```bash
MONGO_URI=mongodb://localhost:27017/ourspace
JWT_SECRET=your-test-secret-key
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
FRONTEND_URL=http://localhost:5173
```

Then run:
```bash
cd server
npm install
npm run dev
```

You should see logs indicating email service is ready.
