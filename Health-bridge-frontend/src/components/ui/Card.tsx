import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "glass" | "interactive";
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = "default",
  children,
  ...props
}) => {
  const variants = {
    default:
      "bg-white border border-slate-200/80 shadow-sm rounded-2xl",
    bordered:
      "bg-white border-2 border-slate-200 rounded-2xl",
    glass:
      "bg-white/80 backdrop-blur-md border border-white/80 shadow-lg rounded-2xl",
    interactive:
      "bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer rounded-2xl",
  };

  return (
    <div className={cn(variants[variant], "p-6 transition-all", className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3
    className={cn("text-lg font-semibold tracking-tight text-[#0A2540]", className)}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn("text-sm text-slate-500", className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => <div className={cn("pt-0", className)} {...props}>{children}</div>;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn("flex items-center pt-4 border-t border-slate-100", className)}
    {...props}
  >
    {children}
  </div>
);

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number | string;
    isPositive?: boolean;
    isNeutral?: boolean;
    label?: string;
  };
  subtitle?: string;
  iconBgColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  iconBgColor = "bg-blue-50 text-blue-600",
  className,
  ...props
}) => {
  return (
    <Card className={cn("relative overflow-hidden", className)} {...props}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {value}
          </div>
        </div>
        {icon && (
          <div className={cn("p-3 rounded-xl flex items-center justify-center shrink-0", iconBgColor)}>
            {icon}
          </div>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center font-semibold px-1.5 py-0.5 rounded-md",
                trend.isNeutral
                  ? "bg-slate-100 text-slate-600"
                  : trend.isPositive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              )}
            >
              {trend.isNeutral ? (
                <Minus className="w-3 h-3 mr-0.5" />
              ) : trend.isPositive ? (
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
              )}
              {trend.value}
            </span>
          )}
          <span className="text-slate-500">
            {trend?.label || subtitle}
          </span>
        </div>
      )}
    </Card>
  );
};

export default Card;
