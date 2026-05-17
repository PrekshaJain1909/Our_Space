import React from "react";

export default function AuthField({
  id,
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  disabled = false,
  required = true,
}) {
  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-field__label">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        className="auth-field__input"
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-required={required}
        disabled={disabled}
      />
    </div>
  );
}
