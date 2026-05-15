const nodemailer = require("nodemailer");
const dns = require("node:dns");
const { otpTemplate } = require("../templates/otpTemplate");
const { inviteTemplate } = require("../templates/inviteTemplate");

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

class EmailDeliveryError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "EmailDeliveryError";
    this.isEmailError = true;
    if (cause) this.cause = cause;
  }
}

let transporter = null;
let transporterReady = false;

const toBool = (value, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  return String(value).toLowerCase() === "true";
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const mask = (input = "") => {
  if (!input || input.length < 4) return "***";
  return `${input.slice(0, 2)}***${input.slice(-2)}`;
};

const getCommonTimeoutConfig = () => ({
  connectionTimeout: toNumber(process.env.SMTP_CONNECTION_TIMEOUT, 15000),
  greetingTimeout: toNumber(process.env.SMTP_GREETING_TIMEOUT, 15000),
  socketTimeout: toNumber(process.env.SMTP_SOCKET_TIMEOUT, 20000),
  family: 4,
});

const createProviderConfig = () => {
  const provider = (process.env.EMAIL_PROVIDER || "gmail").toLowerCase();
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new EmailDeliveryError(
      "Email service not configured. Missing EMAIL_USER or EMAIL_PASS."
    );
  }

  if (provider === "gmail") {
    return {
      provider,
      config: {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        family: 4,
        connectionTimeout: toNumber(process.env.SMTP_CONNECTION_TIMEOUT, 15000),
        greetingTimeout: toNumber(process.env.SMTP_GREETING_TIMEOUT, 15000),
        socketTimeout: toNumber(process.env.SMTP_SOCKET_TIMEOUT, 20000),
        tls: {
          servername: "smtp.gmail.com",
          minVersion: "TLSv1.2",
        },
      },
    };
  }

  if (provider === "brevo") {
    return {
      provider,
      config: {
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        ...getCommonTimeoutConfig(),
      },
    };
  }

  if (provider === "resend") {
    return {
      provider,
      config: {
        host: "smtp.resend.com",
        port: 465,
        secure: true,
        auth: {
          user: "resend",
          pass: emailPass,
        },
        ...getCommonTimeoutConfig(),
      },
    };
  }

  if (provider === "custom") {
    return {
      provider,
      config: {
        host: process.env.SMTP_HOST,
        port: toNumber(process.env.SMTP_PORT, 587),
        secure: toBool(process.env.SMTP_SECURE, false),
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        ...getCommonTimeoutConfig(),
      },
    };
  }

  throw new EmailDeliveryError(`Unknown EMAIL_PROVIDER: ${provider}`);
};

const initializeTransporter = () => {
  const { provider, config } = createProviderConfig();
  const debugEnabled = toBool(process.env.SMTP_DEBUG, true);

  console.log("[Email] Initializing SMTP transporter...");
  console.log(`[Email] Provider: ${provider}`);
  console.log(
    `[Email] SMTP config: host=${config.host} port=${config.port} secure=${config.secure} family=${config.family}`
  );
  console.log(
    `[Email] Timeouts: connection=${config.connectionTimeout}ms greeting=${config.greetingTimeout}ms socket=${config.socketTimeout}ms`
  );
  console.log(`[Email] Auth user: ${mask(config.auth.user)}`);

  transporter = nodemailer.createTransport({
    ...config,
    pool: true,
    maxConnections: toNumber(process.env.SMTP_MAX_CONNECTIONS, 3),
    maxMessages: toNumber(process.env.SMTP_MAX_MESSAGES, 100),
    logger: debugEnabled,
    debug: debugEnabled,
  });

  transporterReady = false;
  return transporter;
};

const parseSmtpError = (error) => {
  const message = error?.message || "Unknown SMTP error";
  const code = error?.code || "UNKNOWN";

  if (
    message.includes("Invalid login")
    || message.includes("Username and Password not accepted")
    || code === "EAUTH"
  ) {
    return "SMTP authentication failed. Use Gmail app password, not your normal Gmail password.";
  }

  if (
    message.includes("Connection timeout")
    || message.includes("ETIMEDOUT")
    || message.includes("ESOCKET")
  ) {
    return "SMTP connection timeout. This is commonly a cloud networking or provider connectivity issue.";
  }

  if (message.includes("ECONNREFUSED")) {
    return "SMTP connection refused by server or blocked network egress.";
  }

  return message;
};

const resetTransporter = () => {
  transporter = null;
  transporterReady = false;
};

const getTransporter = () => {
  if (!transporter) {
    return initializeTransporter();
  }
  return transporter;
};

const verifyTransporter = async () => {
  try {
    const smtp = getTransporter();
    console.log("[Email] Verifying SMTP connection...");
    await smtp.verify();
    transporterReady = true;
    console.log("[Email] SMTP verify successful.");
    return true;
  } catch (error) {
    transporterReady = false;
    console.error("[Email] SMTP verify failed:", error.message);
    console.error("[Email] SMTP verify detail:", parseSmtpError(error));
    return false;
  }
};

const sendMail = async (to, payload) => {
  try {
    const smtp = getTransporter();

    if (!transporterReady) {
      await verifyTransporter();
    }

    const result = await smtp.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Ourspace"}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });

    console.log(`[Email] Sent successfully to ${to}. Message ID: ${result.messageId}`);
    return { ok: true, result };
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error.message);
    console.error("[Email] SMTP error detail:", parseSmtpError(error));

    if (
      error?.message?.includes("ETIMEDOUT")
      || error?.message?.includes("Connection timeout")
      || error?.message?.includes("ESOCKET")
      || error?.message?.includes("ECONNREFUSED")
    ) {
      console.warn("[Email] Resetting transporter after connection failure.");
      resetTransporter();
    }

    return { ok: false, error };
  }
};

const sendOTPEmail = async (email, otp) => {
  const payload = otpTemplate(otp);
  const response = await sendMail(email, payload);

  if (!response.ok) {
    throw new EmailDeliveryError(
      `Email delivery failed: ${response.error?.message || "SMTP error"}`,
      response.error
    );
  }

  return response.result;
};

const sendInviteEmail = async (email, link) => {
  const payload = inviteTemplate(link);
  const response = await sendMail(email, payload);

  if (!response.ok) {
    throw new EmailDeliveryError(
      `Invite email delivery failed: ${response.error?.message || "SMTP error"}`,
      response.error
    );
  }

  return response.result;
};

const isTransporterReady = () => transporterReady;

module.exports = {
  initializeTransporter,
  verifyTransporter,
  isTransporterReady,
  sendOTPEmail,
  sendInviteEmail,
  EmailDeliveryError,
};
