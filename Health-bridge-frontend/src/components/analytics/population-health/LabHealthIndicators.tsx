import type { PopulationLabHealthIndicatorsDto } from "@/types/analytics";

export default function LabHealthIndicators({ data }: { data: PopulationLabHealthIndicatorsDto }) {
  const metrics = [["Published results", data.publishedResults.toLocaleString()], ["Abnormal results", `${data.abnormalResults.toLocaleString()} (${data.abnormalResultPercentage}%)`], ["Critical results", `${data.criticalResults.toLocaleString()} (${data.criticalResultPercentage}%)`]];
  return <div className="space-y-3">{metrics.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm"><span className="text-slate-500">{label}</span><strong className="text-slate-800">{value}</strong></div>)}<p className="text-xs text-slate-400">{data.denominator} {data.limitation}</p></div>;
}
