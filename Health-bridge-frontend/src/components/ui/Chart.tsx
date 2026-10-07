import type { ReactNode } from "react";

export interface ChartProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Chart({ title, description, children, className = "" }: ChartProps) {
  return (
    <section
      aria-labelledby={`chart-${title}`}
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="mb-4">
        <h2 id={`chart-${title}`} className="text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
        {description ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p> : null}
      </div>
      <div className="min-h-48">{children}</div>
    </section>
  );
}

export default Chart;
