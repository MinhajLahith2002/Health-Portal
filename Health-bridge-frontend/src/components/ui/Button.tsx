import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "success" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]";

    const variants = {
      primary:
        "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 focus:ring-blue-500 border border-transparent",
      secondary:
        "bg-white hover:bg-[#EBF3FF] text-[#0052CC] focus:ring-blue-100 border border-blue-100 shadow-sm",
      outline:
        "border border-blue-100 bg-white hover:bg-[#EBF3FF] text-[#0052CC] focus:ring-blue-100 shadow-sm",
      danger:
        "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20 focus:ring-red-500 border border-transparent",
      success:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 focus:ring-emerald-500 border border-transparent",
      ghost:
        "bg-white hover:bg-[#EBF3FF] text-[#0052CC] hover:text-[#0047B3] focus:ring-blue-100 border border-transparent hover:border-blue-100 shadow-sm",
      link: "bg-transparent text-blue-600 hover:underline p-0 h-auto focus:ring-0 active:scale-100",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-6 py-3 gap-2.5",
      icon: "p-2 w-10 h-10 rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
