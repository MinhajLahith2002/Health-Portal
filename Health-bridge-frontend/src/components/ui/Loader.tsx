import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
export { LoadingPage } from "./LoadingPage";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "slate";
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  color = "primary",
  className,
  ...props
}) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const colors = {
    primary: "text-blue-600 dark:text-blue-400",
    white: "text-white",
    slate: "text-slate-400 dark:text-slate-500",
  };

  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <Loader2 className={cn("animate-spin", sizes[size], colors[color])} />
    </div>
  );
};

export const PageLoader: React.FC<{ text?: string }> = ({ text = "LOADING..." }) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center animate-pulse">
          <svg className="w-7 h-7 text-blue-600 fill-current" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm1 14h-2v-3H8v-2h3V7h2v3h3v2h-3v3z" />
          </svg>
        </div>
        <Spinner size="xl" className="absolute -inset-0" />
      </div>
      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-[0.25em] uppercase animate-pulse">
        {text}
      </p>
    </div>
  );
};

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800",
        className
      )}
      {...props}
    />
  );
};

export default Spinner;
