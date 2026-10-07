import type { MonthlyRevenue } from "../types";

export default function EarningsChart({ data }: { data: MonthlyRevenue[] }) {
  const max = Math.max(...data.map((item) => item.amount));
  return <div className="h-64"><div className="flex h-56 items-end gap-3 border-b border-slate-200 sm:gap-5">{data.map((item) => <div key={item.month} className="flex h-full flex-1 flex-col justify-end"><div className="group relative w-full rounded-t-sm bg-blue-500 transition hover:bg-blue-600" style={{ height: `${(item.amount / max) * 85}%` }}><span className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] text-white group-hover:block">LKR {item.amount.toLocaleString()}</span></div><span className="mt-2 text-center text-xs text-slate-500">{item.month}</span></div>)}</div></div>;
}
