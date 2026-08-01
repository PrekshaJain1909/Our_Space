import React, { useEffect } from "react";
import ReactDOM from "react-dom";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md", // "sm" | "md" | "lg" | "xl"
  closeOnBackdrop = true,
  className = "",
}) {
  // Close on Esc key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="modal-backdrop"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Modal card */}
      <div
        className={[
          "relative z-10 w-full mx-3 sm:mx-4",
          sizeClasses[size],
        ].join(" ")}
      >
        <div
          className={[
            "modal-card flex flex-col max-h-[80vh]",
            className,
          ].join(" ")}
        >
          {/* Header */}
          {(title || onClose) && (
            <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
              <h2 className="text-sm sm:text-base font-semibold text-primary">
                {title}
              </h2>
              {onClose && (
                <button
                  onClick={onClose}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border text-secondary hover-text-accent transition text-xs"
                  style={{ borderColor: 'var(--card-border)' }}
                  aria-label="Close"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4 text-sm text-primary">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t px-4 py-3 sm:px-5 sm:py-3" style={{ borderColor: 'var(--card-border)' }}>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {footer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Use portal if #modal-root exists, else normal render
  const modalRoot = document.getElementById("modal-root");
  if (modalRoot) {
    return ReactDOM.createPortal(modalContent, modalRoot);
  }

  return modalContent;
}
