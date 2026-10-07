import type { OperationalCapacityStatus } from "@/types/analytics";

const statusStyles: Record<OperationalCapacityStatus["status"], string> = { Healthy: "bg-emerald-50 text-emerald-700", Watch: "bg-amber-50 text-amber-700", "Capacity Pressure": "bg-rose-50 text-rose-700" };

export default function CapacityStatus({ data }: { data: OperationalCapacityStatus[] }) {
  return <div className="space-y-4">{data.map((entry) => <div key={entry.resource}><div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-xs"><span className="font-medium text-slate-600">{entry.resource}</span><span className={`rounded-full px-2.5 py-1 font-semibold ${statusStyles[entry.status]}`}>{entry.status}</span></div><div className="relative h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${entry.utilization}%` }} /><span className="absolute top-[-2px] h-3 w-0.5 bg-slate-500" style={{ left: `${entry.target}%` }} /></div><div className="mt-1 flex justify-between text-[11px] text-slate-400"><span>{entry.utilization}% used</span><span>Target {entry.target}%</span></div></div>)}</div>;
}
