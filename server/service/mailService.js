const axios = require("axios");
const { otpTemplate } = require("../templates/otpTemplate");
const { inviteTemplate } = require("../templates/inviteTemplate");


const BREVO_API_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

const SENDER = {
  name: "OurSpace",
  email: "prekjainsha190994@gmail.com",
};

const REQUEST_TIMEOUT_MS = Number(process.env.BREVO_API_TIMEOUT_MS || 15000);

// ──────────────────────────────────────────────────────────────────────────
// CUSTOM ERROR HANDLING
// ──────────────────────────────────────────────────────────────────────────

class EmailDeliveryError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = "EmailDeliveryError";
    this.originalError = originalError;
    this.isEmailError = true;

    if (originalError?.response) {
      this.status = originalError.response.status;
      this.response = originalError.response.data;
    }

    if (originalError?.code) {
      this.code = originalError.code;
    }
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
    if (error.response?.status === 400) {
      console.log(
        "[📧 Email API] ✅ Brevo REST API responded (invalid test email expected)"
      );
      return true;
    }

    if (error.response?.status === 403) {
      console.error("[📧 Email API] ❌ Brevo REST API verification FAILED: forbidden");
      console.error(
        "[📧 Email API]    Unauthorized API key or blocked IP detected"
      );
      console.error(
        ` [📧 Email API]    Status: ${error.response.status}`
      );
      console.error(
        `[📧 Email API]    Response: ${JSON.stringify(error.response.data)}`
      );
      return false;
    }

    console.error("[📧 Email API] ❌ Brevo REST API verification FAILED");
    console.error(`[📧 Email API]    Error: ${error.message}`);

    if (error.response) {
      console.error(`[📧 Email API]    Status: ${error.response.status}`);
      console.error(
        `[📧 Email API]    Response: ${JSON.stringify(error.response.data)}`
      );

      if (
        error.response.status === 401 &&
        error.response.data?.code === "unauthorized"
      ) {
        console.error(
          "[📧 Email API]    → ISSUE: Unauthorised IP detected. Add the current server IP to your Brevo authorised IPs."
        );
      }
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

  const isMockKey = !process.env.BREVO_API_KEY || process.env.BREVO_API_KEY === "mock_key" || process.env.BREVO_API_KEY === "dummy";

  if (isMockKey || process.env.NODE_ENV !== "production") {
    console.log("\n=======================================================");
    console.log(`[📧 Email API DEV FALLBACK] To: ${recipientEmail}`);
    console.log(`[📧 Email API DEV FALLBACK] Subject: ${emailPayload.subject}`);
    console.log(`[📧 Email API DEV FALLBACK] Content: ${emailPayload.text || emailPayload.html}`);
    console.log("=======================================================\n");
    if (isMockKey) {
      return {
        success: true,
        messageId: "dev-fallback-mock-key",
        timestamp: new Date().toISOString(),
        protocol: "DEV-FALLBACK",
      };
    }
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
    console.log("[📧 Email API]    Payload:", {
      sender: requestBody.sender,
      to: requestBody.to,
      subject: requestBody.subject,
      htmlContent: requestBody.htmlContent,
      textContent: requestBody.textContent,
    });

    // Make HTTPS REST API call (not SMTP)
    const response = await axios.post(BREVO_API_ENDPOINT, requestBody, {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      timeout: REQUEST_TIMEOUT_MS,
    });

    console.log("[📧 Email API] Brevo Response:", response.data);

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
      console.error(`
[📧 Email API]    HTTP Status: ${error.response.status}`);
      console.error(`
[📧 Email API]    Response: ${JSON.stringify(error.response.data)}`);

      if (error.response.status === 401) {
        console.error(
          "[📧 Email API]    → ISSUE: Invalid BREVO_API_KEY or unauthorized IP."
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
      console.error(`
[📧 Email API]       Timeout after ${REQUEST_TIMEOUT_MS}ms`);
    } else {
      console.error(`[📧 Email API]    Code: ${error.code}`);
      console.error(`[📧 Email API]    Stack: ${error.stack}`);
    }

    console.error("[📧 Email API] ────────────────────────────────────────\n");

    if (!process.env.BREVO_API_KEY) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[📧 Email API] WARNING: BREVO_API_KEY not configured. Skipping email delivery in development."
        );
        return {
          success: true,
          messageId: "dev-fallback",
          timestamp: new Date().toISOString(),
          protocol: "DEV-FALLBACK",
        };
      }
      throw new EmailDeliveryError(
        "BREVO_API_KEY not configured - email delivery disabled",
        error
      );
    }

    const allowDevFallback =
      process.env.NODE_ENV !== "production" &&
      process.env.BREVO_EMAIL_DEV_FALLBACK === "true";

    if (allowDevFallback) {
      console.warn(
        "[📧 Email API] WARNING: Email delivery failed in development but BREVO_EMAIL_DEV_FALLBACK=true allows fallback."
      );
      return {
        success: true,
        messageId: "dev-fallback",
        timestamp: new Date().toISOString(),
        protocol: "DEV-FALLBACK",
      };
    }

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
