import React from "react";

export default function Select({
  label,
  value,
  onChange,
  options = [],          // array of { value, label } or strings
  placeholder = "Select an option",
  icon,                  // optional left icon
  error,
  className = "",
  ...rest
}) {
  // Normalize options: allow ["a", "b"] or [{ value, label }]
  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const showPlaceholder = placeholder && (value === "" || value === undefined || value === null);

  return (
    <div className="w-full space-y-1.5">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-secondary">
          {label}
        </label>
      )}

      {/* Wrapper */}
      <div className={["input-wrapper", error ? "error" : "", className].join(" ") }>
        {/* Left icon */}
        {icon && (
          <span className="text-lg text-secondary select-none">{icon}</span>
        )}

        {/* Select */}
        <select
          value={value ?? ""} // ensure controlled
          onChange={onChange}
          className="input-field appearance-none pr-6"
          {...rest}
        >
          {showPlaceholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}

          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Right chevron */}
        <span className="pointer-events-none text-xs text-secondary -ml-4">
          ▼
        </span>
      </div>

      {/* Error text */}
      {error && <p className="text-xs text-red-400 pl-1">{error}</p>}
    </div>
  );
}
