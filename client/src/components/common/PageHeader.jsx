import React from "react";

export default function PageHeader({
  title,
  subtitle,
  actions, // optional React node (buttons / filters / stats)
  className = "",
}) {
  return (
    <div
      className={[
        "flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-5 md:mb-7",
        className,
      ].join(" ")}
    >
      {/* Left side: title + subtitle */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-primary tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm md:text-[15px] text-secondary mt-1 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side: action buttons / filters */}
      {actions && (
        <div className="mt-2 md:mt-0 flex flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
