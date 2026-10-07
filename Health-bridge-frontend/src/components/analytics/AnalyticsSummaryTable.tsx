import type { DepartmentPerformance } from "@/types/analytics";

const statusStyles: Record<string, string> = { Healthy: "bg-emerald-50 text-emerald-700", Watch: "bg-amber-50 text-amber-700", Attention: "bg-rose-50 text-rose-700" };

export default function AnalyticsSummaryTable({ data }: { data: DepartmentPerformance[] }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-slate-200 text-xs text-slate-400"><tr>{["Department", "Patients", "Appointments", "Utilization", "Revenue", "Status"].map((heading) => <th key={heading} className="px-4 py-3 font-medium first:pl-0">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{data.map((row) => <tr key={row.department} className="text-slate-600"><td className="px-4 py-3.5 pl-0 font-semibold text-slate-800">{row.department}</td><td className="px-4 py-3.5">{row.patients.toLocaleString()}</td><td className="px-4 py-3.5">{row.appointments.toLocaleString()}</td><td className="px-4 py-3.5">{row.utilization}%</td><td className="px-4 py-3.5">Rs. {row.revenue.toFixed(2)}M</td><td className="px-4 py-3.5"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[row.status] ?? "bg-slate-100 text-slate-700"}`}>{row.status}</span></td></tr>)}</tbody></table></div>;
}
