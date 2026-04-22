const PENDING_OTP_EMAIL_KEY = "pending_otp_email";
const PENDING_OTP_USER_ID_KEY = "pending_otp_user_id";

export const getPendingOtpEmail = () =>
  (sessionStorage.getItem(PENDING_OTP_EMAIL_KEY) || "").trim();

export const setPendingOtpEmail = (email) => {
  const normalizedEmail = (email || "").trim();
  if (!normalizedEmail) return;
  sessionStorage.setItem(PENDING_OTP_EMAIL_KEY, normalizedEmail);
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
