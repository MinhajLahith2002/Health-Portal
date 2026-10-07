import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      isPassword = false,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const effectiveType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#0A2540]">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            type={effectiveType}
            disabled={disabled}
            className={cn(
              "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[#0A2540] placeholder:text-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed",
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-200 dark:border-red-500/50"
                : "border-slate-300 focus:border-[#0052CC] focus:ring-[#EBF3FF]",
                leftIcon ? "pl-10" : undefined,
                (rightIcon || isPassword) ? "pr-10" : undefined,
                className
            )}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3.5 text-slate-400 hover:text-[#0052CC] focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3.5 text-slate-400 flex items-center">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {error ? (
          <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
