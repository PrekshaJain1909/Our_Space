import { useContext, useCallback } from "react";
import AuthContext from "../context/AuthContext";
import authApi from "../api/authApi";

export default function useAuth() {
  const {
    user,
    setUser,
    loading,
    setLoading,
    error,
    setError,
  } = useContext(AuthContext);

  /* --------------------------- LOGIN --------------------------- */
  const login = useCallback(async (credentials) => {
  try {
    setLoading(true);
    setError(null);

    const res = await authApi.login(credentials);
    const responseData = res?.data || {};
    const { token, user } = responseData;

    // Support both 403 error responses and legacy 200 OTP-required responses.
    const otpRequired =
      responseData?.code === "USER_UNVERIFIED" ||
      responseData?.redirectTo === "/verify-otp" ||
      (!token && !user && /verify/i.test(responseData?.message || ""));

    if (otpRequired) {
      return {
        success: false,
        status: responseData?.status || 403,
        code: "USER_UNVERIFIED",
        email: responseData?.email,
        message: responseData?.message || "Please verify your OTP before logging in.",
      };
    }

    if (!token || !user) {
      throw new Error("Login response missing token or user");
    }


    localStorage.setItem("auth_token", token);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    console.log("[useAuth] Token saved to localStorage:", token);
    setUser(user);

    // Instead of full reload, notify AuthContext to reload user
    if (typeof window !== "undefined" && window.dispatchEvent) {
      window.dispatchEvent(new Event("auth-token-updated"));
    }

    return { success: true, user };
  } catch (err) {
    const errorData = err?.response?.data || err || {};
    const serverMessage =
      errorData?.message ||
      err?.message ||
      err?.error ||
      "Login failed";

    setError(serverMessage);
    return {
      success: false,
      status: err?.response?.status || err?.status,
      code: errorData?.code,
      email: errorData?.email,
      message: serverMessage,
    };
  } finally {
    setLoading(false);
  }
}, [setUser, setLoading, setError]);
  /* -------------------------- REGISTER -------------------------- */
  const register = useCallback(async (form) => {
    try {
      setLoading(true);
      setError(null);

      const res = await authApi.register(form);
      return { success: true, data: res.data };
    } catch (err) {
      setError(err?.message || err?.error || "Registration failed");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  /* ------------------------- LOAD USER -------------------------- */
  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authApi.getMe();
      setUser(res.data?.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading]);

  /* --------------------------- LOGOUT --------------------------- */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authApi.logout();
    } catch {
      /* even if API fails, still log user out */
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setLoading(false);
    }
  }, [setUser, setLoading]);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    loadUser,
    isAuthenticated:
      !!user ||
      !!localStorage.getItem("auth_token") ||
      !!localStorage.getItem("token"),
  };
}
