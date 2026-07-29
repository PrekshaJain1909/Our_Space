import axiosClient from "../../../api/axiosClient";

const logApi = (label, payload) => {
  if (import.meta.env.DEV) {
    console.log(`[authApi] ${label}`, payload);
  }
};

// ✅ Login (by couple name + either partner's password)
export const login = async (data) => {
  logApi("login request", data);
  const response = await axiosClient.post("/auth/login", data);
  logApi("login response", { status: response.status, data: response.data });
  return response;
};

// ✅ Register Partner A
export const registerPartnerA = async (data) => {
  logApi("registerPartnerA request", data);
  try {
    const response = await axiosClient.post("/auth/register", data);
    logApi("registerPartnerA response", { status: response.status, data: response.data });
    return response.data;
  } catch (error) {
    logApi("registerPartnerA error", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    throw error;
  }
};

// ✅ Register Partner B
export const registerPartnerB = async (data) => {
  logApi("registerPartnerB request", data);
  const response = await axiosClient.post("/invite/register-partnerB", data);
  logApi("registerPartnerB response", { status: response.status, data: response.data });
  return response.data;
};

// ✅ Verify OTP
export const verifyOtp = async (data) => {
  logApi("verifyOtp request", data);
  const response = await axiosClient.post("/otp/verify", data);
  logApi("verifyOtp response", { status: response.status, data: response.data });

  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  return response.data;
};

// ✅ Resend OTP (called from verify page)
export const resendOtp = async (email) => {
  const payload =
    typeof email === "string"
      ? { email }
      : (email || {});

  logApi("resendOtp request", payload);
  const response = await axiosClient.post("/otp/resend", payload);
  logApi("resendOtp response", { status: response.status, data: response.data });
  return response.data;
};

export const getCoupleStatus = async (coupleId) => {
  // Normalize coupleId (accept object or string)
  const id = typeof coupleId === 'string' ? coupleId : (coupleId && (coupleId._id || coupleId.toString()));
  if (!id) throw new Error('Invalid coupleId');
  const response = await axiosClient.get(`/invite/couple-status/${id}`);
  return response.data;
};

export default {
  login,
  registerPartnerA,
  registerPartnerB,
  verifyOtp,
  resendOtp,
  getCoupleStatus,
};
