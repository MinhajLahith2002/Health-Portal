"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PopulationConditionPoint } from "@/types/analytics";

export default function CommonConditionsChart({ data }: { data: PopulationConditionPoint[] }) {
  return <div className="space-y-3"><div className="h-56 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ top: 4, right: 20, left: 10, bottom: 0 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" horizontal={false} /><XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} /><YAxis type="category" dataKey="condition" width={138} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 10 }} /><Tooltip formatter={(value: unknown) => [Number(value ?? 0).toLocaleString(), "Affected Patients"]} contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }} cursor={{ fill: "#eff6ff" }} /><Bar dataKey="affectedPatients" name="Affected Patients" fill="#3b82f6" radius={[0, 5, 5, 0]} barSize={20} /></BarChart></ResponsiveContainer></div><div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">{data.map((entry) => <div key={entry.condition} className="flex items-center justify-between gap-2 text-slate-500"><span className="truncate">{entry.condition}</span><strong className="shrink-0 text-slate-700">{entry.prevalence}%</strong></div>)}</div></div>;
}
