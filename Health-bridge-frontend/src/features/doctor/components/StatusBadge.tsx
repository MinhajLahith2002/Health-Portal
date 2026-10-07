export default function StatusBadge({ status }: { status: string }) {
  const palette = status === "Available" || status === "Approved" || status === "Paid" ? "bg-blue-50 text-blue-700 ring-blue-200" : status === "Rejected" || status === "Unavailable" ? "bg-rose-50 text-rose-700 ring-rose-200" : "bg-amber-50 text-amber-700 ring-amber-200";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${palette}`}>{status}</span>;
}
