import React from "react";

export default function Card({
  children,
  title,
  subtitle,
  footer,
  className = "",
  hover = false,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={[
        "card p-4 md:p-5 transition",
        hover && "cursor-pointer hover-accent",
        className,
      ].join(" ")}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-3 space-y-0.5">
          {title && (
            <h2 className="text-base md:text-lg font-semibold text-primary">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs md:text-sm text-secondary">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Body / content */}
      <div className="text-primary text-sm md:text-base">{children}</div>

      {/* Footer */}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}
