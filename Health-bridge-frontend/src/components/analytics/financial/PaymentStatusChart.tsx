"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { FinancialStatusResponseDto } from "@/types/analytics";

const colors: Record<string, string> = { DRAFT: "#94a3b8", ISSUED: "#2563eb", CANCELLED: "#e11d48", UNPAID: "#f59e0b", PARTIALLY_PAID: "#f97316", PAID: "#0d9488" };

export default function PaymentStatusChart({ data }: { data: FinancialStatusResponseDto[] }) {
  return <div className="flex min-w-0 items-center gap-5"><div className="h-36 w-36 shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="count" nameKey="status" innerRadius={42} outerRadius={64} paddingAngle={3} stroke="none">{data.map((entry) => <Cell key={entry.status} fill={colors[entry.status]} />)}</Pie><Tooltip formatter={(value: unknown) => [Number(value ?? 0).toLocaleString(), "Invoices"]} contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }} /></PieChart></ResponsiveContainer></div><div className="min-w-0 flex-1 space-y-2.5">{data.map((entry) => <div key={entry.status} className="flex items-center justify-between gap-3 text-xs"><span className="flex items-center gap-2 text-slate-500"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[entry.status] }} />{entry.status}</span><strong className="text-slate-800">{entry.count.toLocaleString()}</strong></div>)}</div></div>;
}
