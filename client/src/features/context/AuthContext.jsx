import React, { createContext, useContext, useState, useEffect } from "react";

/**
 * Create Auth Context
 */
const AuthContext = createContext();

/**
 * Auth Provider Component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  /**
   * Load user from localStorage on app start
   */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Invalid stored user data");
        localStorage.removeItem("user");
      }
    }
  }, []);

  /**
   * Login Function
   * Called after OTP verification
   */
  const login = (userData) => {
    if (!userData) return;

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    // Notify app that user data has been updated
    window.dispatchEvent(new CustomEvent("user-data-updated"));
  };

  /**
   * Logout Function
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom Hook
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export default useAuth;
