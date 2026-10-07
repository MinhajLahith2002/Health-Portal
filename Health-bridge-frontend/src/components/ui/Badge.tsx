import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "purple"
    | "neutral"
    | "outline";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  size = "md",
  dot = false,
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full transition-colors";

  const variants = {
    primary: "bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    warning: "bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    danger: "bg-red-50 text-red-700 border border-red-200/80 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
    info: "bg-cyan-50 text-cyan-700 border border-cyan-200/80 dark:bg-cyan-950/50 dark:text-cyan-300 dark:border-cyan-800",
    purple: "bg-purple-50 text-purple-700 border border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    outline: "bg-transparent text-slate-700 border border-slate-300 dark:text-slate-300 dark:border-slate-700",
  };

  const dotColors = {
    primary: "bg-blue-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    info: "bg-cyan-500",
    purple: "bg-purple-500",
    neutral: "bg-slate-500",
    outline: "bg-slate-400",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3.5 py-1.5 gap-2",
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])} />}
      {children}
    </span>
  );
};

export default Badge;
