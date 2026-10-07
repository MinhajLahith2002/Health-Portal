"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RevenuePoint } from "@/types/analytics";

export default function RevenueTrendChart({ data }: { data: RevenuePoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(value: number) => `${value}M`} />
          <Tooltip formatter={(value: unknown) => [`Rs. ${Number(value ?? 0).toFixed(2)}M`, "Revenue"]} contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }} />
          <Bar dataKey="revenue" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}