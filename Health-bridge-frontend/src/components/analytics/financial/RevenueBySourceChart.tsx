"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { FinancialRevenueBySourceDto } from "@/types/analytics";

const colors = ["#2563eb", "#0d9488", "#f59e0b", "#8b5cf6", "#e11d48", "#64748b"];

export default function RevenueBySourceChart({ data }: { data: FinancialRevenueBySourceDto }) {
  const sources = data.sources;
  return <div className="flex min-w-0 flex-col items-center gap-5 sm:flex-row sm:items-center"><div className="h-44 w-44 shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={sources} dataKey="billedAmount" nameKey="category" innerRadius={52} outerRadius={78} paddingAngle={3} stroke="none">{sources.map((entry, index) => <Cell key={entry.category} fill={colors[index % colors.length]} />)}</Pie><Tooltip formatter={(value: unknown) => [`Rs. ${(Number(value ?? 0) / 1_000_000).toFixed(2)}M`, "Billed Revenue"]} contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }} /></PieChart></ResponsiveContainer></div><div className="w-full min-w-0 space-y-2.5">{sources.map((entry, index) => <div key={entry.category} className="flex items-center justify-between gap-3 text-xs"><span className="flex min-w-0 items-center gap-2 text-slate-500"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />{entry.category}</span><strong className="shrink-0 text-slate-800">Rs. {(entry.billedAmount / 1_000_000).toFixed(2)}M <span className="font-medium text-slate-400">({entry.billingItemCount.toLocaleString()} items)</span></strong></div>)}</div></div>;
}
