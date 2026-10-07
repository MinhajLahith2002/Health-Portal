"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PopulationUtilizationPoint } from "@/types/analytics";

export default function HealthcareUtilizationByAge({ data }: { data: PopulationUtilizationPoint[] }) {
  return <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }} barGap={3}><CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="ageGroup" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} /><Tooltip formatter={(value: unknown) => [Number(value ?? 0).toLocaleString(), "Visits"]} contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }} cursor={{ fill: "#eff6ff" }} /><Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} /><Bar dataKey="appointments" name="Appointments" fill="#2563eb" radius={[4, 4, 0, 0]} /><Bar dataKey="consultations" name="Consultations" fill="#0d9488" radius={[4, 4, 0, 0]} /><Bar dataKey="labTests" name="Lab Tests" fill="#f59e0b" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>;
}
