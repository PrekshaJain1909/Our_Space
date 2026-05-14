import axiosClient from "../../../api/axiosClient";

// ✅ Login (by couple name + either partner's password)
export const login = async (data) => {
  const response = await axiosClient.post("/auth/login", data);
  return response;
};

// ✅ Register Partner A
export const registerPartnerA = async (data) => {
  const response = await axiosClient.post("/auth/register", data);
  return response.data;
};

// ✅ Register Partner B
export const registerPartnerB = async (data) => {
  const response = await axiosClient.post("/invite/register-partnerB", data);
  return response.data;
};

// ✅ Verify OTP
export const verifyOtp = async (data) => {
  const response = await axiosClient.post("/otp/verify", data);

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

  const response = await axiosClient.post("/otp/resend", payload);
  return response.data;
};

export const getCoupleStatus = async (coupleId) => {
  const response = await axiosClient.get(`/invite/couple-status/${coupleId}`);
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
