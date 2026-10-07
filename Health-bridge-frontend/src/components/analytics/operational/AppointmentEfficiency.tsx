import type { OperationalAppointmentEfficiency } from "@/types/analytics";

export default function AppointmentEfficiency({ data }: { data: OperationalAppointmentEfficiency[] }) {
  const latest = data[data.length - 1];
  const completionRate = Math.round((latest.completed / latest.scheduled) * 1000) / 10;
  const metrics = [{ label: "Scheduled", value: latest.scheduled.toLocaleString() }, { label: "Completed", value: latest.completed.toLocaleString() }, { label: "Cancelled", value: latest.cancelled.toLocaleString() }, { label: "No-show", value: latest.noShow.toLocaleString() }, { label: "Average wait", value: `${latest.averageWait} min` }, { label: "On-time start", value: `${latest.onTimeRate}%` }];
  return <div className="space-y-5"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{metrics.map((metric) => <div key={metric.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="text-[11px] text-slate-400">{metric.label}</p><p className="mt-1 text-lg font-bold text-slate-800">{metric.value}</p></div>)}</div><div><div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-medium text-slate-600">Completion rate</span><strong className="text-blue-600">{completionRate}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${completionRate}%` }} /></div></div></div>;
}
