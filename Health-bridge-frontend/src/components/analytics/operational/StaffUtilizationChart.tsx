"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { OperationalStaffUtilization } from "@/types/analytics";

export default function StaffUtilizationChart({ data }: { data: OperationalStaffUtilization[] }) {
  return <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 24 }} barGap={4}><CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="category" interval={0} angle={-20} textAnchor="end" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 10 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} /><Tooltip formatter={(value: unknown) => [Number(value ?? 0).toLocaleString(), "Staff"]} contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }} cursor={{ fill: "#eff6ff" }} /><Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} /><Bar dataKey="available" name="Available" fill="#bfdbfe" radius={[4, 4, 0, 0]} /><Bar dataKey="active" name="Active" fill="#2563eb" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>;
}
