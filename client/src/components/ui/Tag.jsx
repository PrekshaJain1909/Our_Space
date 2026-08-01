import React from "react";

export default function Tag({
  children,
  icon,            // optional emoji / icon
  variant = "default", // "default" | "success" | "warning" | "danger" | "pink"
  onClick,
  className = "",
  rounded = true,  // fully rounded or soft rounded
  small = false,   // compact version
}) {
  const variants = {
    default: "tag default",
    success: "tag success",
    warning: "tag warning",
    danger: "tag danger",
    pink: "tag pink",
  };

  return (
    <span
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1 border font-medium select-none",
            small ? "text-[10px] px-2 py-[3px]" : "text-xs px-3 py-[5px]",
            rounded ? "rounded-full" : "rounded-md",
            variants[variant],
            onClick && "cursor-pointer hover:opacity-80 transition",
            className,
      ].join(" ")}
    >
      {icon && <span className="text-sm">{icon}</span>}
      {children}
    </span>
  );
}
