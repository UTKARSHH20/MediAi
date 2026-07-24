"use client";

import { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "critical";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
}

const variantMap: Record<BadgeVariant, string> = {
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  critical: "bg-red-600 text-white",
  info: "badge-info",
  neutral: "badge-neutral",
};

const dotColorMap: Record<BadgeVariant, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  critical: "bg-white",
  info: "bg-sky-500",
  neutral: "bg-slate-500",
};

export default function Badge({ children, variant = "info", size = "md", dot = false }: BadgeProps) {
  return (
    <span
      className={`badge ${variantMap[variant]} ${size === "sm" ? "text-xs px-2 py-0.5" : ""}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColorMap[variant]}`} />
      )}
      {children}
    </span>
  );
}
