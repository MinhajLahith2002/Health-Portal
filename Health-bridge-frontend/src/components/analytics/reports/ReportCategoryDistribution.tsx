import type { CategoryDistributionDTO } from "@/types/analytics";

export default function ReportCategoryDistribution({ categories }: { categories: CategoryDistributionDTO[] }) {
  if (!categories.length) return <p className="py-10 text-center text-sm text-slate-400">Category distribution is unavailable.</p>;
  return <div className="space-y-3">{categories.map((entry) => <div key={entry.category} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-3 text-sm"><span className="font-medium text-slate-600">{entry.category}</span><strong className="text-slate-800">{entry.count.toLocaleString()}</strong></div>)}</div>;
}
