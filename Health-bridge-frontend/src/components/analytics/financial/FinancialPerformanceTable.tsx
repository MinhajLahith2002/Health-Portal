import type { FinancialSummaryDto } from "@/types/analytics";

const money = (value: number) => `Rs. ${(value / 1_000_000).toFixed(2)}M`;

export default function FinancialPerformanceTable({ data }: { data: FinancialSummaryDto }) {
  const rows = [["Invoice count", data.invoiceCount.toLocaleString()], ["Billed revenue", money(data.billedRevenue)], ["Paid invoices", data.paidInvoiceCount.toLocaleString()], ["Unpaid invoices", data.unpaidInvoiceCount.toLocaleString()], ["Partially paid invoices", data.partiallyPaidInvoiceCount.toLocaleString()], ["Known unpaid invoice amount", money(data.knownUnpaidInvoiceAmount)]];
  return <div><div className="divide-y divide-slate-100">{rows.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm"><span className="text-slate-500">{label}</span><strong className="text-slate-800">{value}</strong></div>)}</div><p className="mt-3 text-xs text-amber-700">{data.limitation}</p></div>;
}
