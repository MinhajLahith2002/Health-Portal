"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { OperationalBedOccupancy } from "@/types/analytics";

const statusColors = { Healthy: "#60a5fa", Watch: "#f59e0b", Critical: "#e11d48" };

export default function BedOccupancyChart({ data }: { data: OperationalBedOccupancy[] }) {
  return <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 10, bottom: 0 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" horizontal={false} /><XAxis type="number" domain={[0, 100]} tickFormatter={(value: number) => `${value}%`} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} /><YAxis type="category" dataKey="department" width={108} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} /><Tooltip formatter={(value: unknown) => [`${Number(value ?? 0)}%`, "Bed Occupancy"]} contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }} cursor={{ fill: "#eff6ff" }} /><Bar dataKey="occupancy" radius={[0, 5, 5, 0]} barSize={22}>{data.map((entry) => <Cell key={entry.department} fill={statusColors[entry.status]} />)}</Bar></BarChart></ResponsiveContainer></div>;
}
