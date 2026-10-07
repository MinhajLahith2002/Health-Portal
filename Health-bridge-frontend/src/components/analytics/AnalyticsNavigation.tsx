"use client";

import { Activity, BarChart3, FileBarChart2, Landmark, LayoutDashboard, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const analyticsNavigation = [
  { label: "Analytics Dashboard", href: "/analytics", icon: LayoutDashboard, color: "blue" },
  { label: "Healthcare Analytics", href: "/analytics/healthcare", icon: Activity, color: "green" },
  { label: "Financial Analytics", href: "/analytics/financial", icon: Landmark, color: "purple" },
  { label: "Operational Analytics", href: "/analytics/operational", icon: BarChart3, color: "orange" },
  { label: "Population Health", href: "/analytics/population-health", icon: Users, color: "rose" },
  { label: "Reports Analytics", href: "/analytics/reports", icon: FileBarChart2, color: "cyan" },
] as const;

const moduleStyles = {
  blue: { accent: "border-l-blue-500", icon: "bg-blue-50 text-blue-700 group-hover:bg-blue-100", arrow: "bg-blue-50/80 text-blue-700 group-hover:bg-blue-100" },
  green: { accent: "border-l-emerald-500", icon: "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100", arrow: "bg-emerald-50/80 text-emerald-700 group-hover:bg-emerald-100" },
  purple: { accent: "border-l-purple-500", icon: "bg-purple-50 text-purple-700 group-hover:bg-purple-100", arrow: "bg-purple-50/80 text-purple-700 group-hover:bg-purple-100" },
  orange: { accent: "border-l-orange-500", icon: "bg-orange-50 text-orange-700 group-hover:bg-orange-100", arrow: "bg-orange-50/80 text-orange-700 group-hover:bg-orange-100" },
  rose: { accent: "border-l-rose-500", icon: "bg-rose-50 text-rose-700 group-hover:bg-rose-100", arrow: "bg-rose-50/80 text-rose-700 group-hover:bg-rose-100" },
  cyan: { accent: "border-l-cyan-500", icon: "bg-cyan-50 text-cyan-700 group-hover:bg-cyan-100", arrow: "bg-cyan-50/80 text-cyan-700 group-hover:bg-cyan-100" },
} as const;

export default function AnalyticsNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Analytics navigation" className="mt-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {analyticsNavigation.map(({ label, href, icon: Icon, color }) => {
          const isActive = pathname === href;
          const styles = moduleStyles[color];

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`group flex h-[166px] flex-col rounded-xl border border-l-4 p-4 text-left shadow-sm transition-[background-color,border-color,box-shadow,transform] duration-200 motion-safe:hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 motion-reduce:transition-none ${isActive ? "border-blue-200 border-l-blue-500 bg-blue-50 ring-2 ring-blue-100 hover:border-blue-300 hover:bg-blue-100/60" : `border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 ${styles.accent}`}`}
            >
              <div className="flex h-full items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${isActive ? "bg-blue-600 text-white" : styles.icon}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-sm font-semibold text-slate-900">{label}</h2>
                    {isActive && <span className="shrink-0 rounded-full bg-blue-600/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-700">Current</span>}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Open {label.toLowerCase()}</p>
                </div>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl font-medium leading-none transition-[background-color,transform] duration-200 motion-safe:group-hover:translate-x-1 motion-reduce:transition-none ${styles.arrow}`} aria-hidden="true">→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
