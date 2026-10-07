"use client";

import { Area, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FinancialRevenueTrendPointDto } from "@/types/analytics";

const money = (value: unknown) => `Rs. ${(Number(value ?? 0) / 1_000_000).toFixed(2)}M`;

export default function RevenueTrendChart({ data }: { data: FinancialRevenueTrendPointDto[] }) {
  return <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}><defs><linearGradient id="financialRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.22} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="periodLabel" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(value: number) => `${(value / 1_000_000).toFixed(1)}M`} /><Tooltip formatter={(value: unknown) => [money(value), "Billed Revenue"]} contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }} cursor={{ stroke: "#bfdbfe", strokeWidth: 1 }} /><Area type="monotone" dataKey="billedRevenue" stroke="#2563eb" fill="url(#financialRevenue)" strokeWidth={2.5} /></ComposedChart></ResponsiveContainer></div>;
}
