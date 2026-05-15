const nodemailer = require("nodemailer");
const dns = require("node:dns");
const { otpTemplate } = require("../templates/otpTemplate");
const { inviteTemplate } = require("../templates/inviteTemplate");

// Render can prefer IPv6 paths that time out for SMTP, so force IPv4-first.
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

const maskEmail = (value = "") => {
  if (!value || !value.includes("@")) return "***";
  const [name, domain] = value.split("@");
  return `${name.slice(0, 2)}***@${domain}`;
};

const createTransportConfig = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new EmailDeliveryError("Brevo email is not configured. Set EMAIL_USER and EMAIL_PASS.");
  }

  return {
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    family: 4,
    connectionTimeout: toNumber(process.env.SMTP_CONNECTION_TIMEOUT, 15000),
    greetingTimeout: toNumber(process.env.SMTP_GREETING_TIMEOUT, 15000),
    socketTimeout: toNumber(process.env.SMTP_SOCKET_TIMEOUT, 20000),
  };
};

const initializeTransporter = () => {
  const debugEnabled = toBool(process.env.SMTP_DEBUG, true);
  const config = createTransportConfig();

  console.log("[Email] Initializing Brevo SMTP transporter...");
  console.log(
    `[Email] Host=${config.host} Port=${config.port} Secure=${config.secure} Family=${config.family}`
  );
  console.log(
    `[Email] Timeouts: connection=${config.connectionTimeout}ms greeting=${config.greetingTimeout}ms socket=${config.socketTimeout}ms`
  );
  console.log(`[Email] Auth user=${maskEmail(config.auth.user)}`);

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

  if (code === "EAUTH" || message.includes("Invalid login")) {
    return "Brevo authentication failed. Check your SMTP login and password.";
  }

  if (message.includes("Connection timeout") || message.includes("ETIMEDOUT") || message.includes("ESOCKET")) {
    return "SMTP connection timeout. This usually means a network path, firewall, or provider reachability issue.";
  }

  if (message.includes("ECONNREFUSED")) {
    return "SMTP connection refused by the remote server.";
  }

  return message;
};

const getTransporter = () => {
  if (!transporter) {
    return initializeTransporter();
  }
  return transporter;
};

const resetTransporter = () => {
  transporter = null;
  transporterReady = false;
};

const verifyTransporter = async () => {
  try {
    const smtp = getTransporter();
    console.log("[Email] Verifying Brevo SMTP connection...");
    await smtp.verify();
    transporterReady = true;
    console.log("[Email] Brevo SMTP verification succeeded.");
    return true;
  } catch (error) {
    transporterReady = false;
    console.error("[Email] Brevo SMTP verification failed:", error.message);
    console.error("[Email] Brevo SMTP detail:", parseSmtpError(error));
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

    console.log(`[Email] Sent email to ${to}. Message ID: ${result.messageId}`);
    return { ok: true, result };
  } catch (error) {
    console.error(`[Email] Failed to send email to ${to}:`, error.message);
    console.error("[Email] SMTP detail:", parseSmtpError(error));

    if (error?.message?.includes("Connection timeout") || error?.message?.includes("ETIMEDOUT") || error?.message?.includes("ECONNREFUSED")) {
      resetTransporter();
    }

    return { ok: false, error };
  }
};

const sendOTPEmail = async (email, otp) => {
  const payload = otpTemplate(otp);
  const response = await sendMail(email, payload);

  if (!response.ok) {
    throw new EmailDeliveryError(`Email delivery failed: ${response.error?.message || "SMTP error"}`, response.error);
  }

  return response.result;
};

const sendInviteEmail = async (email, link) => {
  const payload = inviteTemplate(link);
  const response = await sendMail(email, payload);

  if (!response.ok) {
    throw new EmailDeliveryError(`Invite email delivery failed: ${response.error?.message || "SMTP error"}`, response.error);
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
