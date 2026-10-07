"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { OperationalResourceTrendPoint } from "@/types/analytics";

export default function ResourceUtilizationTrend({ data }: { data: OperationalResourceTrendPoint[] }) {
  return <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} /><YAxis domain={[0, 100]} tickFormatter={(value: number) => `${value}%`} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} /><Tooltip formatter={(value: unknown) => [`${Number(value ?? 0)}%`, "Utilization"]} contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }} cursor={{ stroke: "#bfdbfe", strokeWidth: 1 }} /><Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} /><Line type="monotone" dataKey="beds" name="Beds" stroke="#2563eb" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="staff" name="Staff" stroke="#8b5cf6" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="equipment" name="Equipment" stroke="#0d9488" strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="laboratory" name="Laboratory Capacity" stroke="#f59e0b" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></div>;
}
