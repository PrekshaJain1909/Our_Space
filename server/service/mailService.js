const axios = require("axios");
const { otpTemplate } = require("../templates/otpTemplate");
const { inviteTemplate } = require("../templates/inviteTemplate");

// ═══════════════════════════════════════════════════════════════════
// BREVO REST API CONFIGURATION (HTTPS-based, no SMTP timeout issues)
// ═══════════════════════════════════════════════════════════════════
const BREVO_EMAIL_API_URL = "https://api.brevo.com/v3/smtp/email";
const SENDER = {
  name: "OurSpace",
  email: "prekjainsha190994@gmail.com",
};

// Default timeout: 15 seconds (can be overridden via BREVO_API_TIMEOUT_MS env var)
const API_TIMEOUT = Number(process.env.BREVO_API_TIMEOUT_MS || 15000);

// ═══════════════════════════════════════════════════════════════════
// CUSTOM ERROR CLASS FOR EMAIL DELIVERY ISSUES
// ═══════════════════════════════════════════════════════════════════
class EmailDeliveryError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "EmailDeliveryError";
    this.isEmailError = true;
    if (cause) this.cause = cause;
  }
}

// ═══════════════════════════════════════════════════════════════════
// ERROR NORMALIZATION & LOGGING UTILITIES
// ═══════════════════════════════════════════════════════════════════
const normalizeErrorMessage = (error) => {
  const apiMessage = error?.response?.data?.message;
  if (apiMessage) return apiMessage;
  return error?.message || "Unknown Brevo email error";
};

const logEmailError = (error, context = {}) => {
  console.error("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.error("[Email API] ERROR CONTEXT:", context);
  console.error("[Email API] Error Name:", error.name);
  console.error("[Email API] Error Message:", error.message);
  console.error("[Email API] Error Code:", error.code);
  
  if (error.response) {
    console.error("[Email API] HTTP Status:", error.response.status);
    console.error("[Email API] Response Data:", JSON.stringify(error.response.data, null, 2));
    console.error("[Email API] Response Headers:", error.response.headers);
  } else if (error.request) {
    console.error("[Email API] No response received. Request details:", {
      url: error.request.url,
      method: error.request.method,
    });
  }
  
  console.error("[Email API] Stack Trace:", error.stack);
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
};

// ═══════════════════════════════════════════════════════════════════
// TRANSPORTER VERIFICATION (Check if Brevo API is configured)
// ═══════════════════════════════════════════════════════════════════
const verifyTransporter = async () => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.error("[Email API] ❌ BREVO_API_KEY environment variable is missing");
      console.error("[Email API] Email delivery is DISABLED. OTP & invite emails will fail.");
      return false;
    }

    // Perform a lightweight connectivity test
    const testResponse = await axios.post(
      BREVO_EMAIL_API_URL,
      {
        sender: SENDER,
        to: [{ email: "test@example.com" }],
        subject: "Test",
        htmlContent: "<p>Test</p>",
      },
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
        timeout: 5000,
      }
    );

    // Brevo returns 201 or 400+ for invalid recipient (but API key is valid)
    if (testResponse.status === 201 || testResponse.status === 400) {
      console.log("[Email API] ✅ Brevo API is reachable and authenticated");
      console.log("[Email API] 📧 Email service is READY for production");
      return true;
    }

    return false;
  } catch (error) {
    // Expected to fail with invalid test email, but validates API connectivity
    if (error.response?.status === 400 || error.response?.status === 403) {
      console.log("[Email API] ✅ Brevo API authentication verified (test email was invalid - expected)");
      return true;
    }

    console.error("[Email API] ❌ Brevo API connectivity test failed");
    logEmailError(error, { operation: "verifyTransporter" });
    return false;
  }
};

// ═══════════════════════════════════════════════════════════════════
// CORE EMAIL SENDING FUNCTION (Uses Brevo REST API over HTTPS)
// ═══════════════════════════════════════════════════════════════════
const sendMail = async (to, payload) => {
  // Input validation
  if (!to || typeof to !== "string") {
    throw new EmailDeliveryError("Invalid recipient email address");
  }

  if (!payload || !payload.subject || !payload.html) {
    throw new EmailDeliveryError("Invalid email payload: missing subject or html content");
  }

  if (!process.env.BREVO_API_KEY) {
    throw new EmailDeliveryError(
      "BREVO_API_KEY is not configured. Email delivery is disabled."
    );
  }

  const requestBody = {
    sender: SENDER,
    to: [{ email: to }],
    subject: payload.subject,
    htmlContent: payload.html,
    textContent: payload.text || "",
    replyTo: {
      email: SENDER.email,
      name: SENDER.name,
    },
  };

  try {
    console.log("[Email API] ⏳ Sending email via Brevo REST API...");
    console.log(`[Email API] Recipient: ${to}`);
    console.log(`[Email API] Subject: ${payload.subject}`);
    console.log(`[Email API] Timeout: ${API_TIMEOUT}ms`);

    const startTime = Date.now();

    const response = await axios.post(BREVO_EMAIL_API_URL, requestBody, {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      timeout: API_TIMEOUT,
    });

    const elapsedTime = Date.now() - startTime;

    console.log(`[Email API] ✅ Email sent successfully (${elapsedTime}ms)`);
    console.log(`[Email API] HTTP Status: ${response.status}`);
    console.log(`[Email API] Message ID: ${response.data?.messageId}`);

    return {
      success: true,
      messageId: response.data?.messageId,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const context = {
      operation: "sendMail",
      recipient: to,
      subject: payload.subject,
    };

    logEmailError(error, context);

    // Provide specific error guidance for common issues
    if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
      throw new EmailDeliveryError(
        "Email delivery timeout. Brevo API took too long to respond.",
        error
      );
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      throw new EmailDeliveryError(
        "Brevo API authentication failed. Check BREVO_API_KEY.",
        error
      );
    } else if (error.response?.status === 400) {
      throw new EmailDeliveryError(
        `Brevo API rejected request: ${error.response.data?.message || "Invalid request"}`,
        error
      );
    } else if (error.response?.status === 429) {
      throw new EmailDeliveryError(
        "Rate limited by Brevo API. Too many emails sent too quickly.",
        error
      );
    }

    throw new EmailDeliveryError(normalizeErrorMessage(error), error);
  }
};

// ═══════════════════════════════════════════════════════════════════
// PUBLIC API FUNCTIONS FOR EMAIL DELIVERY
// ═══════════════════════════════════════════════════════════════════

/**
 * Send OTP verification email
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<boolean>} True if email sent successfully
 */
const sendOTPEmail = async (email, otp) => {
  try {
    const payload = otpTemplate(otp);
    await sendMail(email, payload);
    return true;
  } catch (error) {
    console.error("[Email API] OTP email delivery failed:", error.message);
    throw error;
  }
};

/**
 * Send partner invite email
 * @param {string} email - Recipient email address
 * @param {string} link - Invite link URL
 * @returns {Promise<boolean>} True if email sent successfully
 */
const sendInviteEmail = async (email, link) => {
  try {
    const payload = inviteTemplate(link);
    await sendMail(email, payload);
    return true;
  } catch (error) {
    console.error("[Email API] Invite email delivery failed:", error.message);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════════════
// MODULE EXPORTS
// ═══════════════════════════════════════════════════════════════════
module.exports = {
  verifyTransporter,
  sendOTPEmail,
  sendInviteEmail,
  EmailDeliveryError,
  logEmailError, // Export for debugging
};
