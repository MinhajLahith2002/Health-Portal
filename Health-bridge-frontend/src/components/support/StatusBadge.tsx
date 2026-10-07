import { TicketStatus } from "@/types/support";

const STATUS_STYLES: Record<TicketStatus, string> = {
  OPEN: "bg-amber-50 text-amber-700 border-amber-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  SOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Open",
  PROCESSING: "Processing",
  SOLVED: "Solved",
};

export default function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </span>
  );
}
