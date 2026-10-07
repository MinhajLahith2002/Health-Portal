import type { LucideIcon } from "lucide-react";

export default function DoctorStatsCard({ label, value, detail, icon: Icon, tone = "teal" }: { label: string; value: string; detail: string; icon: LucideIcon; tone?: "teal" | "blue" | "amber" | "rose" }) {
  const colors = { teal: "bg-blue-50 text-blue-700", blue: "bg-blue-50 text-blue-700", amber: "bg-amber-50 text-amber-700", rose: "bg-rose-50 text-rose-700" };
  return <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-950">{value}</p></div><span className={`flex h-10 w-10 items-center justify-center rounded-md ${colors[tone]}`}><Icon className="h-5 w-5" /></span></div><p className="mt-3 text-xs text-slate-500">{detail}</p></div>;
}
