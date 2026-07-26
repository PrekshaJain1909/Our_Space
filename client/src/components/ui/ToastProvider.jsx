import React, { createContext, useContext, useCallback } from "react";
import useTheme from "../../hooks/useTheme";
import { showToast } from "../../utils/swalTheme";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const theme = useTheme();

  const showToast = useCallback((type, message, options = {}) => {
    const iconMap = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };

    return showToast(theme, {
      icon: iconMap[type] || 'info',
      title: message,
      text: options.text,
      timer: options.timer || 2000,
      position: options.position || 'top-end',
    });
  }, [theme]);

  const value = {
    success: (msg, options) => showToast("success", msg, options),
    error: (msg, options) => showToast("error", msg, options),
    warning: (msg, options) => showToast("warning", msg, options),
    info: (msg, options) => showToast("info", msg, options),
    removeToast: () => null,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  return useContext(ToastContext);
}
