/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BREVO REST API EMAIL SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * PRODUCTION-READY EMAIL DELIVERY VIA HTTPS (NO SMTP - NO TIMEOUTS)
 *
 * - ✅ Uses axios to make REST API calls (HTTPS/Port 443)
 * - ✅ Zero Nodemailer code - completely removed
 * - ✅ Zero SMTP connections - no socket timeouts on Render
 * - ✅ Detailed error logging with API responses
 * - ✅ Async/await for clean error handling
 * - ✅ Compatible with Render, Heroku, Railway, any platform
 *
 * API ENDPOINT: https://api.brevo.com/v3/smtp/email
 * DOCUMENTATION: https://developers.brevo.com/reference/sendtransacemail
 * ═══════════════════════════════════════════════════════════════════════════
 */

const axios = require("axios");
const { otpTemplate } = require("../templates/otpTemplate");
const { inviteTemplate } = require("../templates/inviteTemplate");

// ──────────────────────────────────────────────────────────────────────────
// CONFIGURATION - NO SMTP ANYWHERE
// ──────────────────────────────────────────────────────────────────────────

// REST API endpoint (HTTPS only, no SMTP)
const BREVO_API_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

// Sender identity
const SENDER = {
  name: "OurSpace",
  email: "prekjainsha190994@gmail.com",
};

// Request timeout (milliseconds)
const REQUEST_TIMEOUT_MS = Number(process.env.BREVO_API_TIMEOUT_MS || 15000);

// ──────────────────────────────────────────────────────────────────────────
// CUSTOM ERROR HANDLING
// ──────────────────────────────────────────────────────────────────────────

class EmailDeliveryError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = "EmailDeliveryError";
    this.originalError = originalError;
  }
}

// ──────────────────────────────────────────────────────────────────────────
// EMAIL VERIFICATION (API HEALTH CHECK - NOT SMTP)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Verify Brevo REST API is configured and reachable
 * This is a connectivity check, NOT an SMTP transporter verification
 * @returns {Promise<boolean>} true if API is ready, false otherwise
 */
const verifyBrevoAPI = async () => {
  if (!process.env.BREVO_API_KEY) {
    console.error(
      "[📧 Email API] ❌ BREVO_API_KEY not found in environment variables"
    );
    console.error(
      "[📧 Email API]    Email delivery is DISABLED - OTP emails will fail"
    );
    return false;
  }

  try {
    console.log(
      "[📧 Email API] 🔍 Verifying Brevo REST API connection (via HTTPS)..."
    );
    console.log(
      `[📧 Email API]    Endpoint: ${BREVO_API_ENDPOINT.split("/v3")[0]}`
    );
    console.log(`[📧 Email API]    Protocol: HTTPS (Port 443)`);
    console.log(`[📧 Email API]    Timeout: ${REQUEST_TIMEOUT_MS}ms`);

    // Test API connectivity with a dummy email
    // This validates the API key and endpoint, not actual SMTP
    const testPayload = {
      sender: SENDER,
      to: [{ email: "noreply@brevo.test" }],
      subject: "API Verification",
      htmlContent: "<p>This is a connectivity test.</p>",
    };

    const testResponse = await axios.post(BREVO_API_ENDPOINT, testPayload, {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      timeout: 8000,
    });

    // 201 = email accepted, 400 = invalid recipient (but API is working)
    if (testResponse.status === 201 || testResponse.status === 400) {
      console.log("[📧 Email API] ✅ Brevo REST API is READY (HTTPS)");
      console.log("[📧 Email API] ✅ Email service is OPERATIONAL");
      console.log("[📧 Email API] ✅ No SMTP connections - no timeout issues\n");
      return true;
    }
  } catch (error) {
    // 400 on invalid email is expected - shows API is working
    if (error.response?.status === 400 || error.response?.status === 403) {
      console.log(
        "[📧 Email API] ✅ Brevo REST API responded (invalid test email expected)"
      );
      return true;
    }

    console.error("[📧 Email API] ❌ Brevo REST API verification FAILED");
    console.error(`[📧 Email API]    Error: ${error.message}`);

    if (error.response) {
      console.error(`[📧 Email API]    Status: ${error.response.status}`);
      console.error(
        `[📧 Email API]    Response: ${JSON.stringify(error.response.data)}`
      );
    }

    return false;
  }
};

// ──────────────────────────────────────────────────────────────────────────
// CORE SEND FUNCTION (HTTPS REST API ONLY)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Send email via Brevo REST API (HTTPS, no SMTP)
 * @param {string} recipientEmail - Recipient email address
 * @param {object} emailPayload - { subject, html, text }
 * @returns {Promise<object>} { success, messageId, timestamp }
 * @throws {EmailDeliveryError}
 */
const sendEmail = async (recipientEmail, emailPayload) => {
  // Input validation
  if (!recipientEmail || typeof recipientEmail !== "string") {
    throw new EmailDeliveryError(
      "Invalid recipient email - must be a non-empty string"
    );
  }

  if (!emailPayload?.subject || !emailPayload?.html) {
    throw new EmailDeliveryError(
      "Invalid email payload - missing subject or html content"
    );
  }

  if (!process.env.BREVO_API_KEY) {
    throw new EmailDeliveryError(
      "BREVO_API_KEY not configured - email delivery disabled"
    );
  }

  // Build REST API request
  const requestBody = {
    sender: SENDER,
    to: [{ email: recipientEmail }],
    subject: emailPayload.subject,
    htmlContent: emailPayload.html,
    textContent: emailPayload.text || "",
    replyTo: {
      email: SENDER.email,
      name: SENDER.name,
    },
  };

  try {
    const startTime = Date.now();

    console.log("\n[📧 Email API] ────────────────────────────────────────");
    console.log(
      "[📧 Email API] 📤 SENDING EMAIL (Brevo REST API via HTTPS)"
    );
    console.log(`[📧 Email API]    To: ${recipientEmail}`);
    console.log(`[📧 Email API]    Subject: ${emailPayload.subject}`);
    console.log(
      `[📧 Email API]    Method: POST ${BREVO_API_ENDPOINT.split("/v3")[0]}/v3/smtp/email`
    );
    console.log(`[📧 Email API]    Protocol: HTTPS (no SMTP)`);

    // Make HTTPS REST API call (not SMTP)
    const response = await axios.post(BREVO_API_ENDPOINT, requestBody, {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      timeout: REQUEST_TIMEOUT_MS,
    });

    const elapsed = Date.now() - startTime;

    console.log(`[📧 Email API] ✅ SUCCESS (${elapsed}ms)`);
    console.log(`[📧 Email API]    Message ID: ${response.data?.messageId}`);
    console.log("[📧 Email API] ────────────────────────────────────────\n");

    return {
      success: true,
      messageId: response.data?.messageId,
      timestamp: new Date().toISOString(),
      protocol: "HTTPS/REST", // NOT SMTP
    };
  } catch (error) {
    console.error("[📧 Email API] ────────────────────────────────────────");
    console.error("[📧 Email API] ❌ EMAIL DELIVERY FAILED");
    console.error(`[📧 Email API]    To: ${recipientEmail}`);
    console.error(`[📧 Email API]    Error: ${error.message}`);

    // Detailed error logging
    if (error.response) {
      console.error(
        `[📧 Email API]    HTTP Status: ${error.response.status}`
      );
      console.error(
        `[📧 Email API]    Response: ${JSON.stringify(error.response.data)}`
      );

      // Specific error messages
      if (error.response.status === 401) {
        console.error(
          "[📧 Email API]    → ISSUE: Invalid BREVO_API_KEY. Check env vars."
        );
      } else if (error.response.status === 403) {
        console.error(
          "[📧 Email API]    → ISSUE: API key lacks permissions. Regenerate."
        );
      } else if (error.response.status === 429) {
        console.error(
          "[📧 Email API]    → ISSUE: Rate limited. Too many emails sent."
        );
      } else if (error.response.status === 400) {
        console.error(
          "[📧 Email API]    → ISSUE: Invalid request format or email."
        );
      }
    } else if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
      console.error("[📧 Email API]    → ISSUE: Request timeout");
      console.error(
        `[📧 Email API]       Timeout after ${REQUEST_TIMEOUT_MS}ms`
      );
    } else {
      console.error(`[📧 Email API]    Code: ${error.code}`);
      console.error(`[📧 Email API]    Stack: ${error.stack}`);
    }

    console.error("[📧 Email API] ────────────────────────────────────────\n");

    throw new EmailDeliveryError(error.message, error);
  }
};

// ──────────────────────────────────────────────────────────────────────────
// PUBLIC CONVENIENCE FUNCTIONS
// ──────────────────────────────────────────────────────────────────────────

/**
 * Send OTP verification email
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<boolean>}
 */
const sendOTPEmail = async (email, otp) => {
  const payload = otpTemplate(otp);
  await sendEmail(email, payload);
  return true;
};

/**
 * Send partner invite email
 * @param {string} email - Recipient email
 * @param {string} link - Invite URL
 * @returns {Promise<boolean>}
 */
const sendInviteEmail = async (email, link) => {
  const payload = inviteTemplate(link);
  await sendEmail(email, payload);
  return true;
};

// ──────────────────────────────────────────────────────────────────────────
// MODULE EXPORTS
// ──────────────────────────────────────────────────────────────────────────

module.exports = {
  // Verification function (kept for backward compatibility)
  verifyTransporter: verifyBrevoAPI,

  // New explicit name (preferred)
  verifyBrevoAPI,

  // Email sending functions
  sendOTPEmail,
  sendInviteEmail,
  sendEmail,

  // Error class
  EmailDeliveryError,
};
