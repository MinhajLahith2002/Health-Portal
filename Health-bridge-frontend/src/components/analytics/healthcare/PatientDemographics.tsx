"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DemographicPoint } from "@/types/healthcareAnalytics";

const ageColors = ["#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8"];
const genderColors = ["#2563eb", "#14b8a6", "#f59e0b", "#94a3b8"];

function Distribution({ data, colors }: { data: DemographicPoint[]; colors: string[] }) {
  return <div className="flex min-w-0 items-center gap-3"><div className="h-32 w-32 shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="label" innerRadius={36} outerRadius={57} paddingAngle={3} stroke="none">{data.map((entry, index) => <Cell key={entry.label} fill={colors[index % colors.length]} />)}</Pie><Tooltip formatter={(value: unknown) => [`${Number(value ?? 0)}%`, "Patients"]} contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }} /></PieChart></ResponsiveContainer></div><div className="min-w-0 space-y-2">{data.map((entry, index) => <div key={entry.label} className="flex items-center justify-between gap-4 text-xs"><span className="flex items-center gap-2 text-slate-500"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />{entry.label}</span><strong className="text-slate-800">{entry.value}%</strong></div>)}</div></div>;
}

export default function PatientDemographics({ ageGroups, genderDistribution }: { ageGroups: DemographicPoint[]; genderDistribution: DemographicPoint[] }) {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2"><div><h3 className="mb-2 text-xs font-semibold text-slate-600">Age groups</h3><Distribution data={ageGroups} colors={ageColors} /></div><div><h3 className="mb-2 text-xs font-semibold text-slate-600">Gender distribution</h3><Distribution data={genderDistribution} colors={genderColors} /></div></div>;
}
