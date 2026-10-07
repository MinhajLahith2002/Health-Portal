import type { ReactNode } from "react";

export default function HealthcarePanel({ title, description, children, className = "" }: { title: string; description: string; children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)] sm:p-5 ${className}`}><div className="mb-4"><h2 className="text-sm font-bold text-slate-900">{title}</h2><p className="mt-1 text-xs text-slate-400">{description}</p></div>{children}</section>;
}