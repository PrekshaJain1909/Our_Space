# Render Deployment Setup Guide

## Brevo SMTP Configuration

This backend now uses Brevo SMTP only for OTP and invite emails.

### Render Environment Variables

Set these on your Render service:

```bash
EMAIL_PROVIDER=brevo
EMAIL_USER=your-brevo-smtp-login
EMAIL_PASS=your-brevo-smtp-key
EMAIL_FROM=verified-sender@yourdomain.com
EMAIL_FROM_NAME=Ourspace
SMTP_CONNECTION_TIMEOUT=15000
SMTP_GREETING_TIMEOUT=15000
SMTP_SOCKET_TIMEOUT=20000
SMTP_MAX_CONNECTIONS=3
SMTP_MAX_MESSAGES=100
SMTP_DEBUG=true
```

### Required App Variables

```bash
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_long_random_secret
FRONTEND_URL=https://your-frontend.vercel.app
```

### Brevo Setup

1. Create a Brevo account.
2. Enable SMTP in the Brevo dashboard.
3. Copy the SMTP login and SMTP key.
4. Verify your sender domain or sender email in Brevo.
5. Paste the values into Render and redeploy.

### Deployment Checklist

- Confirm `EMAIL_USER` and `EMAIL_PASS` match Brevo SMTP credentials.
- Confirm `EMAIL_FROM` is a verified sender in Brevo.
- Redeploy the Render service after changing env vars.
- Check startup logs for SMTP verification success.
- Test OTP registration and resend flows.

### Local Development Example

```bash
MONGO_URI=mongodb://localhost:27017/ourspace
JWT_SECRET=your-test-secret-key
EMAIL_PROVIDER=brevo
EMAIL_USER=your-brevo-smtp-login
EMAIL_PASS=your-brevo-smtp-key
EMAIL_FROM=verified-sender@yourdomain.com
EMAIL_FROM_NAME=Ourspace
FRONTEND_URL=http://localhost:5173
```
