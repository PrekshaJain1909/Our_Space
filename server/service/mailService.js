const axios = require("axios");
const { otpTemplate } = require("../templates/otpTemplate");
const { inviteTemplate } = require("../templates/inviteTemplate");

const BREVO_EMAIL_API_URL = "https://api.brevo.com/v3/smtp/email";
const SENDER = {
  name: "OurSpace",
  email: "prekjainsha190994@gmail.com",
};

class EmailDeliveryError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "EmailDeliveryError";
    this.isEmailError = true;
    if (cause) this.cause = cause;
  }
}

const normalizeErrorMessage = (error) => {
  const apiMessage = error?.response?.data?.message;
  if (apiMessage) return apiMessage;
  return error?.message || "Unknown Brevo email error";
};

const verifyTransporter = async () => {
  if (!process.env.BREVO_API_KEY) {
    console.error("[Email API] BREVO_API_KEY is missing.");
    return false;
  }

  console.log("[Email API] Brevo API key detected. Email API client is ready.");
  return true;
};

const sendMail = async (to, payload) => {
  if (!process.env.BREVO_API_KEY) {
    throw new EmailDeliveryError("BREVO_API_KEY is missing");
  }

  const requestBody = {
    sender: SENDER,
    to: [{ email: to }],
    subject: payload.subject,
    htmlContent: payload.html,
    textContent: payload.text,
  };

  try {
    console.log("[Email API] Sending email via Brevo REST API...");
    console.log(`[Email API] To: ${to}`);
    console.log(`[Email API] Subject: ${payload.subject}`);

    const response = await axios.post(
      BREVO_EMAIL_API_URL,
      requestBody,
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
        timeout: Number(process.env.BREVO_API_TIMEOUT_MS || 15000),
      }
    );

    console.log("[Email API] Brevo response status:", response.status);
    console.log("[Email API] Brevo response data:", response.data);
    console.log("[Email API] Email sent. Message ID:", response.data?.messageId);

    return true;
  } catch (error) {
    console.error("FULL EMAIL ERROR:");
    console.error(error);
    console.error("MESSAGE:", error.message);
    console.error("CODE:", error.code);
    console.error("RESPONSE STATUS:", error.response?.status);
    console.error("RESPONSE DATA:", error.response?.data);

    throw new EmailDeliveryError(normalizeErrorMessage(error), error);
  }
};

const sendOTPEmail = async (email, otp) => {
  const payload = otpTemplate(otp);
  await sendMail(email, payload);
  return true;
};

const sendInviteEmail = async (email, link) => {
  const payload = inviteTemplate(link);
  await sendMail(email, payload);
  return true;
};

module.exports = {
  verifyTransporter,
  sendOTPEmail,
  sendInviteEmail,
  EmailDeliveryError,
};
