import React from "react";

export default function StatsCard({
  title,
  value,
  icon,                // optional emoji/icon
  trend,               // number (positive or negative) — % change
  trendLabel,          // optional text (e.g., "vs last week")
  onClick,             // clickable card
  className = "",
}) {
  const clickable = typeof onClick === "function";

  const trendColor =
    trend > 0
      ? "text-success"
      : trend < 0
      ? "text-danger"
      : "text-secondary";

  return (
    <div
      onClick={onClick}
      className={[
        "card transition",
        clickable && "cursor-pointer hover-accent",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        {icon && (
          <div className="text-2xl md:text-3xl leading-none select-none">
            {icon}
          </div>
        )}

        {/* Text */}
        <div className="flex-1">
          <h3 className="text-xs md:text-sm font-medium text-secondary">
            {title}
          </h3>
          <div className="text-xl md:text-2xl font-semibold text-primary mt-1">
            {value}
          </div>
        </div>
      </div>

      {/* Trend */}
      {typeof trend === "number" && (
        <div className="mt-3 flex items-center gap-2 text-xs md:text-sm">
          <span className={trendColor}>
            {trend > 0 && "▲ "}
            {trend < 0 && "▼ "}
            {Math.abs(trend)}%
          </span>
          {trendLabel && (
            <span className="text-secondary">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
