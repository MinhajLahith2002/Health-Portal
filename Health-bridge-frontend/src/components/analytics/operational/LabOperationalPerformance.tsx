import type { OperationalLabPerformance } from "@/types/analytics";

export default function LabOperationalPerformance({ data }: { data: OperationalLabPerformance[] }) {
  const latest = data[data.length - 1];
  const completionRate = Math.round((latest.completedTests / latest.testsReceived) * 1000) / 10;
  const metrics = [{ label: "Tests received", value: latest.testsReceived.toLocaleString() }, { label: "Completed tests", value: latest.completedTests.toLocaleString() }, { label: "Pending tests", value: latest.pendingTests.toLocaleString() }, { label: "Critical results", value: latest.criticalResults.toLocaleString() }, { label: "Avg turnaround", value: `${latest.averageTurnaround} hrs` }];
  return <div className="space-y-5"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{metrics.map((metric) => <div key={metric.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="text-[11px] text-slate-400">{metric.label}</p><p className="mt-1 text-lg font-bold text-slate-800">{metric.value}</p></div>)}</div><div><div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-medium text-slate-600">Completion rate</span><strong className="text-teal-600">{completionRate}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-500" style={{ width: `${completionRate}%` }} /></div></div></div>;
}
