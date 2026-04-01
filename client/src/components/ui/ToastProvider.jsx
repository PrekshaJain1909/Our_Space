import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [visible, setVisible] = useState(false);
  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setVisible(true);
    setTimeout(() => setVisible(false), 3500);
  }, []);
  const removeToast = useCallback(() => setVisible(false), []);

  const value = {
    success: (msg) => showToast("success", msg),
    error: (msg) => showToast("error", msg),
    warning: (msg) => showToast("warning", msg),
    info: (msg) => showToast("info", msg),
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast message={toast?.message} type={toast?.type} visible={visible} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  return useContext(ToastContext);
}

function Toast({ message, type, visible, onClose }) {
  if (!visible || !message) return null;
  const typeClasses = {
    success: "border-pink-500 bg-pink-500 text-white shadow-pink-500/30",
    error: "border-rose-600 bg-rose-500 text-white shadow-rose-500/30",
    warning: "border-amber-500 bg-amber-400 text-slate-900 shadow-amber-400/30",
    info: "border-sky-600 bg-sky-500 text-white shadow-sky-500/30",
  };

  return (
    <div
      role="alert"
      onClick={onClose}
      className={[
        "fixed left-1/2 top-8 z-[9999] min-w-[220px] -translate-x-1/2 cursor-pointer rounded-xl border px-7 py-3.5 text-center text-[15px] font-medium shadow-xl transition-opacity duration-300",
        typeClasses[type] || typeClasses.info,
      ].join(" ")}
    >
      {message}
    </div>
  );
}
