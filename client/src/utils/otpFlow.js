const PENDING_OTP_EMAIL_KEY = "pending_otp_email";
const PENDING_OTP_USER_ID_KEY = "pending_otp_user_id";
const PENDING_OTP_SENT_AT_KEY = "pending_otp_sent_at";

export const getPendingOtpEmail = () =>
  (sessionStorage.getItem(PENDING_OTP_EMAIL_KEY) || "").trim();

export const setPendingOtpEmail = (email) => {
  const normalizedEmail = (email || "").trim();
  if (!normalizedEmail) return;
  sessionStorage.setItem(PENDING_OTP_EMAIL_KEY, normalizedEmail);
  // Record when OTP was last sent so frontend can show countdown
  try {
    sessionStorage.setItem(PENDING_OTP_SENT_AT_KEY, String(Date.now()));
  } catch (e) {
    // ignore sessionStorage errors
  }
};

export const clearPendingOtpEmail = () => {
  sessionStorage.removeItem(PENDING_OTP_EMAIL_KEY);
};

export const getPendingOtpUserId = () =>
  (sessionStorage.getItem(PENDING_OTP_USER_ID_KEY) || "").trim();

export const setPendingOtpUserId = (userId) => {
  const normalizedUserId = (userId || "").toString().trim();
  if (!normalizedUserId) return;
  sessionStorage.setItem(PENDING_OTP_USER_ID_KEY, normalizedUserId);
};

export const clearPendingOtpContext = () => {
  sessionStorage.removeItem(PENDING_OTP_EMAIL_KEY);
  sessionStorage.removeItem(PENDING_OTP_USER_ID_KEY);
  sessionStorage.removeItem(PENDING_OTP_SENT_AT_KEY);
};

export const getPendingOtpSentAt = () => {
  const v = sessionStorage.getItem(PENDING_OTP_SENT_AT_KEY);
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
};

export const buildVerifyOtpPath = ({ email = "", query = "" } = {}) => {
  const params = new URLSearchParams((query || "").replace(/^\?/, ""));
  const normalizedEmail = (email || "").trim();

  if (normalizedEmail) {
    params.set("email", normalizedEmail);
  }

  const queryString = params.toString();
  return queryString ? `/verify-otp?${queryString}` : "/verify-otp";
};
