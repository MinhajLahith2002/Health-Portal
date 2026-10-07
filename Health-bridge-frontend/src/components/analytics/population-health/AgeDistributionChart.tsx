"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PopulationAgeDistributionDto } from "@/types/analytics";

const colors = ["#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8"];

export default function AgeDistributionChart({ data }: { data: PopulationAgeDistributionDto }) {
  const distribution = data.distribution.map((entry) => ({ label: entry.ageGroup, count: entry.count, percentage: data.totalPatientAccounts ? (entry.count / data.totalPatientAccounts) * 100 : 0 }));
  return <div className="flex min-w-0 items-center gap-4"><div className="h-40 w-40 shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={distribution} dataKey="count" nameKey="label" innerRadius={45} outerRadius={70} paddingAngle={3} stroke="none">{distribution.map((entry, index) => <Cell key={entry.label} fill={colors[index % colors.length]} />)}</Pie><Tooltip formatter={(value: unknown) => [Number(value ?? 0).toLocaleString(), "Patients"]} contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }} /></PieChart></ResponsiveContainer></div><div className="min-w-0 flex-1 space-y-2">{distribution.map((entry, index) => <div key={entry.label} className="flex items-center justify-between gap-3 text-xs"><span className="flex items-center gap-2 text-slate-500"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />{entry.label}</span><strong className="shrink-0 text-slate-800">{entry.percentage.toFixed(1)}% <span className="font-normal text-slate-400">({entry.count.toLocaleString()})</span></strong></div>)}<p className="text-[11px] text-slate-400">{data.note}</p></div></div>;
}
