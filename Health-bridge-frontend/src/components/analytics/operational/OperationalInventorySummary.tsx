import type { OperationalInventorySummaryDto } from "@/types/analytics";

const labels: Record<string, string> = {
  IN_STOCK: "In stock",
  LOW_STOCK: "Low stock",
  OUT_OF_STOCK: "Out of stock",
  EXPIRED: "Expired",
};

export default function OperationalInventorySummary({ data }: { data: OperationalInventorySummaryDto }) {
  return <div className="space-y-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{data.statusBreakdown.map((entry) => <div key={entry.status} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><p className="text-[11px] text-slate-400">{labels[entry.status] ?? entry.status}</p><p className="mt-1 text-lg font-bold text-slate-800">{entry.count.toLocaleString()}</p></div>)}</div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-sm"><span className="text-slate-500">Inventory value</span><strong className="text-slate-800">Rs. {data.inventoryValue.toLocaleString()}</strong></div><p className="text-xs text-slate-400">{data.definition} {data.excludedValueRecords ? `${data.excludedValueRecords.toLocaleString()} records excluded from value coverage.` : ""}</p></div>;
}
