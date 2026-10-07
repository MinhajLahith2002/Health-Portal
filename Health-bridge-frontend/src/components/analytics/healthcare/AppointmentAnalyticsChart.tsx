"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AppointmentAnalyticsPoint } from "@/types/healthcareAnalytics";

export default function AppointmentAnalyticsChart({ data }: { data: AppointmentAnalyticsPoint[] }) {
  return <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}><CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} /><Tooltip contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} /><Bar dataKey="booked" name="Booked" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={10} /><Bar dataKey="completed" name="Completed" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={10} /><Bar dataKey="cancelled" name="Cancelled" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={10} /><Bar dataKey="noShow" name="No-show" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={10} /></BarChart></ResponsiveContainer></div>;
}