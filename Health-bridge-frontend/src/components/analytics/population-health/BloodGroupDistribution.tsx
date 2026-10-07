import type { PopulationBloodGroupDistributionDto } from "@/types/analytics";

export default function BloodGroupDistribution({ data }: { data: PopulationBloodGroupDistributionDto }) {
  return <div className="space-y-2.5">{data.distribution.map((entry) => <div key={entry.bloodGroup} className="flex items-center justify-between gap-3 text-xs"><span className="text-slate-500">{entry.bloodGroup}</span><strong className="text-slate-800">{entry.count.toLocaleString()}</strong></div>)}<p className="pt-2 text-[11px] text-slate-400">{data.note}</p></div>;
}
