import React from "react";
import Button from "../../../components/ui/Button.jsx";

export default function AuthForm({
  title,
  subtitle,
  onSubmit,
  children,
  submitLabel,
  loading = false,
  submitIcon = "💖",
  footer,          // optional React node (links, text)
  className = "",
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={["space-y-4 fade-in", className].join(" ")}
      noValidate
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-2">
          {title && (
            <h2 className="text-lg font-semibold text-primary">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs text-secondary mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Form fields */}
      <div className="space-y-3">
        {children}
      </div>

      {/* Submit */}
      {submitLabel && (
        <div className="pt-2">
          <Button
            type="submit"
            full
            loading={loading}
            leftIcon={submitIcon}
          >
            {submitLabel}
          </Button>
        </div>
      )}

      {/* Footer (links: login/register switch, etc.) */}
      {footer && (
        <div className="mt-3 text-[11px] text-secondary">
          {footer}
        </div>
      )}
    </form>
  );
}
