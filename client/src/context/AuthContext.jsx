import React, { createContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync auth state from localStorage so login/OTP flows share one source of truth.
  const loadMe = useCallback(() => {
    const authToken = localStorage.getItem("auth_token");
    const token = localStorage.getItem("token");
    const sessionToken = authToken || token;
    const storedUser = localStorage.getItem("user");

    if (!sessionToken || !storedUser) {
      setUser(null);
      setError(null);
      setLoading(false);
      return;
    }

    // Keep both token keys in sync while legacy code still references both.
    if (!authToken) localStorage.setItem("auth_token", sessionToken);
    if (!token) localStorage.setItem("token", sessionToken);

    try {
      setLoading(true);
      setUser(JSON.parse(storedUser));
      setError(null);
    } catch (err) {
      console.error("Failed to parse stored user:", err);
      setUser(null);
      localStorage.removeItem("user");
      setError("Session data invalid. Please login again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + listen for session changes from login/verify/logout flows.
  useEffect(() => {
    loadMe();

    const handler = () => loadMe();
    window.addEventListener("auth-token-updated", handler);
    window.addEventListener("user-data-updated", handler);

    return () => {
      window.removeEventListener("auth-token-updated", handler);
      window.removeEventListener("user-data-updated", handler);
    };
  }, [loadMe]);


  const value = {
    user,
    setUser,
    loading,
    setLoading,
    error,
    setError,
    refreshUser: loadMe, // 👈 optional helper
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
