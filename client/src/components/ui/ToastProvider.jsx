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
  const baseStyle = {
    position: 'fixed',
    top: 32,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
    minWidth: 220,
    padding: '14px 28px',
    borderRadius: 10,
    boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 500,
    border: '1.5px solid',
    cursor: 'pointer',
    transition: 'opacity 0.3s',
    opacity: visible ? 1 : 0,
    background: '#222',
  };
  const typeColors = {
    success: { background: '#2ecc40', borderColor: '#27ae60' },
    error: { background: '#e74c3c', borderColor: '#c0392b' },
    warning: { background: '#f1c40f', borderColor: '#f39c12', color: '#222' },
    info: { background: '#3498db', borderColor: '#2980b9' },
  };
  const style = { ...baseStyle, ...(typeColors[type] || typeColors.info) };
  return (
    <div style={style} role="alert" onClick={onClose}>
      {message}
    </div>
  );
}
