import React from "react";

export default function Button({
  type = "button",
  children,
  onClick,
  variant = "primary", // "primary" | "secondary" | "danger" | "ghost"
  full = false,        // full width button
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = "",
}) {
  const isDisabled = disabled || loading;

  const variants = {
    primary: "btn btn-primary",
    secondary: "btn btn-secondary",
    danger: "btn btn-danger",
    ghost: "btn btn-ghost",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        "flex items-center justify-center gap-2 text-sm font-medium transition select-none",
        full ? "w-full" : "w-auto",
        variants[variant],
        isDisabled &&
          "opacity-60 cursor-not-allowed hover:bg-inherit hover:text-inherit",
        className,
      ].join(" ")}
    >
      {/* Left Icon */}
      {leftIcon && <span className="text-base">{leftIcon}</span>}

      {/* Button Text */}
      {!loading ? (
        children
      ) : (
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin text-white"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-30"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          Loading...
        </span>
      )}

      {/* Right Icon */}
      {rightIcon && <span className="text-base">{rightIcon}</span>}
    </button>
  );
}
