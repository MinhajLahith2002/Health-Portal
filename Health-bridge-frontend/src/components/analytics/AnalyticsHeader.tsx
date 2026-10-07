"use client";

import type { AnalyticsPeriod } from "@/types/analytics";

const analyticsPeriods: { label: string; value: AnalyticsPeriod }[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
];

type AnalyticsHeaderProps = {
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  title?: string;
  subtitle?: string;
  lastUpdated?: string;
};

export default function AnalyticsHeader({ period, onPeriodChange, title = "Analytics & Reporting", subtitle = "Healthcare performance, financial insights, and operational overview.", lastUpdated = "Today, 10:42 AM" }: AnalyticsHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Health Bridge insights</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <p className="text-[11px] text-slate-400">Last updated: {lastUpdated}</p>
        <div className="flex max-w-full flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1" aria-label="Time period">
          {analyticsPeriods.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onPeriodChange(option.value)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:px-4 ${period === option.value ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
