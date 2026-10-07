"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PatientTrendPoint } from "@/types/analytics";

export default function PatientTrendChart({ data }: { data: PatientTrendPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
          <defs><linearGradient id="patients-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.22} /><stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} /></linearGradient></defs>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <Tooltip contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }} />
          <Area type="monotone" dataKey="patients" stroke="#2563eb" strokeWidth={2.5} fill="url(#patients-fill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}