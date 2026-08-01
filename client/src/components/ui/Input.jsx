import React, { useState } from "react";

export default function Input({
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  icon,               // optional left icon (emoji or icon component)
  error,              // string | undefined
  textarea = false,   // convert to <textarea>
  rows = 4,           // textarea rows
  passwordToggle = false, // show/hide password ability
  className = "",
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    type === "password" && passwordToggle
      ? showPassword
        ? "text"
        : "password"
      : type;

  return (
    <div className="w-full space-y-1.5">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-secondary">
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className={["input-wrapper", error ? "error" : "", className].join(" ") }>
        {/* Left Icon */}
        {icon && (
          <span className="text-lg text-secondary select-none">{icon}</span>
        )}

        {/* Textarea mode */}
          {textarea ? (
          <textarea
            rows={rows}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={"bg-white dark:bg-[#07001fcc] border border-pink-200 dark:border-none text-gray-900 dark:text-white placeholder-pink-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 p-2 rounded-md input-field " + className}
            {...rest}
          />
        ) : (
          <input
            type={inputType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={"bg-white dark:bg-[#07001fcc] border border-pink-200 dark:border-none text-gray-900 dark:text-white placeholder-pink-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-300 p-2 rounded-md input-field " + className}
            {...rest}
          />
        )}

        {/* Password toggle button */}
        {type === "password" && passwordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs text-secondary hover-text-accent transition"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400 pl-1">{error}</p>
      )}
    </div>
  );
}
