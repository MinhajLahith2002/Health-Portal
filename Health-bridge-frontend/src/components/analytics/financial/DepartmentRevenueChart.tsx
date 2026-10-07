"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FinancialDepartmentRevenue } from "@/types/analytics";

export default function DepartmentRevenueChart({ data }: { data: FinancialDepartmentRevenue[] }) {
  return <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 12, bottom: 0 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" horizontal={false} /><XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(value: number) => `Rs. ${value}M`} /><YAxis type="category" dataKey="department" width={104} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} /><Tooltip formatter={(value: unknown) => [`Rs. ${Number(value ?? 0).toFixed(2)}M`, "Revenue"]} contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }} cursor={{ fill: "#eff6ff" }} /><Bar dataKey="revenue" fill="#0d9488" radius={[0, 5, 5, 0]} barSize={22} /></BarChart></ResponsiveContainer></div>;
}
