import type { FinancialRevenueGrowth } from "@/types/analytics";

export default function RevenueGrowth({ data }: { data: FinancialRevenueGrowth[] }) {
  const maximum = Math.max(...data.map((entry) => entry.growth));
  return <div className="space-y-4">{data.map((entry) => <div key={entry.source}><div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="font-medium text-slate-600">{entry.source}</span><strong className="text-emerald-600">+{entry.growth.toFixed(1)}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${(entry.growth / maximum) * 100}%` }} /></div></div>)}</div>;
}
