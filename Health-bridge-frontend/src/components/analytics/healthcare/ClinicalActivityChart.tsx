"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { LaboratoryStatusPoint } from "@/types/healthcareAnalytics";

export default function ClinicalActivityChart({ data }: { data: LaboratoryStatusPoint[] }) {
  return <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="status" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} /><Tooltip contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} /><Bar dataKey="orders" name="Lab test orders" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={22} /></BarChart></ResponsiveContainer></div>;
}
