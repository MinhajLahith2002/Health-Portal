"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FinancialTransactionPoint } from "@/types/analytics";

export default function TransactionActivityChart({ data }: { data: FinancialTransactionPoint[] }) {
  return <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }} barGap={2}><CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} /><Tooltip formatter={(value: unknown) => [Number(value ?? 0).toLocaleString(), "Transactions"]} contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }} cursor={{ fill: "#eff6ff" }} /><Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} /><Bar dataKey="successful" name="Successful" fill="#2563eb" radius={[3, 3, 0, 0]} /><Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[3, 3, 0, 0]} /><Bar dataKey="failed" name="Failed" fill="#e11d48" radius={[3, 3, 0, 0]} /><Bar dataKey="refunds" name="Refunds" fill="#8b5cf6" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div>;
}
