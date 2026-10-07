"use client";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  getAllTickets,
  getTicketByIdForAdmin,
  updateTicketStatus,
  replyAsAdmin,
  editReplyAsAdmin,
  deleteReplyAsAdmin,
} from "@/services/supportService";
import { Ticket, TicketSummary, TicketStatus } from "@/types/support";
import StatusBadge from "@/components/support/StatusBadge";
import ChatBubble from "@/components/support/ChatBubble";
import ReplyComposer from "@/components/support/ReplyComposer";

const FILTERS: Array<TicketStatus | "ALL"> = ["ALL", "OPEN", "PROCESSING", "SOLVED"];
const STATUS_OPTIONS: TicketStatus[] = ["OPEN", "PROCESSING", "SOLVED"];

function formatListDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function AdminTicketsPage() {
  const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TicketStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadList = async () => {
    setLoadingList(true);
    setListError(null);

    try {
      const data = await getAllTickets();

      const sortedData = [...data].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
      );

      setTickets(sortedData);

      setSelectedId((current) =>
        current ?? (sortedData.length > 0 ? sortedData[0].id : null)
      );
    } catch (e) {
      setListError(
        e instanceof Error ? e.message : "Failed to load tickets."
      );
    } finally {
      setLoadingList(false);
    }
  };

  const loadTicket = async (id: string) => {
    setLoadingTicket(true);
    setTicketError(null);
    try {
      const data = await getTicketByIdForAdmin(id);
      setTicket(data);
    } catch (e) {
      setTicketError(e instanceof Error ? e.message : "Failed to load ticket.");
    } finally {
      setLoadingTicket(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    if (selectedId) loadTicket(selectedId);
  }, [selectedId]);

  useEffect(() => {
    const ticketId = searchParams.get("ticketId");

    if (ticketId) {
      setSelectedId(ticketId);
    }
  }, [searchParams]);

  const handleSend = async (message: string, image: File | null) => {
    if (!selectedId) return;
    setSending(true);
    try {
      const updated = await replyAsAdmin(selectedId, message, image);
      setTicket(updated);
      await loadList();
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!ticket || !selectedId) return;
    setUpdatingStatus(true);
    try {
      const updated = await updateTicketStatus(selectedId, status);
      setTicket(updated);
      await loadList();
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEdit = async (replyId: string, message: string) => {
    if (!selectedId) return;
    const updated = await editReplyAsAdmin(selectedId, replyId, message);
    setTicket(updated);
    await loadList();
  };

  const handleDelete = async (replyId: string) => {
    if (!selectedId) return;
    const updated = await deleteReplyAsAdmin(selectedId, replyId);
    setTicket(updated);
    await loadList();
  };

  // Filtered by both status tab and search query
  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const matchesFilter = filter === "ALL" || t.status === filter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        t.userName?.toLowerCase().includes(query) ||
        t.subject?.toLowerCase().includes(query) 
       

      return matchesFilter && matchesSearch;
    });
  }, [tickets, filter, searchQuery]);

  const counts: Record<TicketStatus | "ALL", number> = useMemo(
    () => ({
      ALL: tickets.length,
      OPEN: tickets.filter((t) => t.status === "OPEN").length,
      PROCESSING: tickets.filter((t) => t.status === "PROCESSING").length,
      SOLVED: tickets.filter((t) => t.status === "SOLVED").length,
    }),
    [tickets]
  );

  return (
    <div
      className="flex h-screen bg-white text-[#242424]"
      style={{ fontFamily: "'Segoe UI', Roboto, system-ui, sans-serif" }}
    >
      {/* Left: ticket list pane */}
      <div className="flex w-[380px] shrink-0 flex-col border-r border-[#E1DFDD] bg-white">
   <div className="flex items-center gap-3">
  {/* Back + Title */}
  <button
    onClick={() => window.history.back()}
    className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
    aria-label="Go back"
  >
    <ArrowLeft size={22} />
  </button>

  <h1 className="text-[15px] font-semibold text-[#242424]">
    All Support Tickets
  </h1>

  {/* Support Documents */}
  <Link
    href="/support/admin/document"
    className="ml-auto inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
  >
    Support Documents
  </Link>
</div>   
        {/* Search Input Bar */}
        <div className="px-4 pt-2">
          <div className="relative flex items-center">
            <svg
              className="absolute left-3 h-4 w-4 text-[#616161]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, subject..."
              className="w-full rounded-md border border-[#E1DFDD] bg-[#FAF9F8] py-1.5 pl-9 pr-8 text-xs text-[#242424] placeholder-[#616161] outline-none focus:border-[#0F6CBD] focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-xs text-[#616161] hover:text-[#242424]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-4 border-b border-[#E1DFDD] px-4 pt-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pb-2 text-sm font-medium transition ${
                filter === f
                  ? "border-b-2 border-[#0F6CBD] text-[#0F6CBD]"
                  : "border-b-2 border-transparent text-[#616161] hover:text-[#242424]"
              }`}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()} · {counts[f]}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingList && <p className="px-4 py-3 text-sm text-[#616161]">Loading tickets…</p>}
          {listError && <p className="px-4 py-3 text-sm text-red-600">{listError}</p>}

          {!loadingList && !listError && filtered.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-[#616161]">
              {searchQuery ? "No tickets matching your search." : "No tickets in this category."}
            </p>
          )}

          {filtered.map((t) => {
            const isActive = t.id === selectedId;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`flex w-full items-start gap-3 border-b border-[#EDEBE9] px-4 py-3 text-left transition ${
                  isActive ? "bg-[#EBF3FC]" : "hover:bg-[#F5F5F5]"
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F6CBD]/10 text-xs font-semibold text-[#0F6CBD]">
                  {(t.userName || "?").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-[#242424]">{t.userName}</p>
                    <span className="shrink-0 text-xs text-[#616161]">{formatListDate(t.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#616161]">
                    {t.subject}
                    {t.hasAttachment && " · Attachment"}
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Middle: reading pane */}
      <div className="flex flex-1 flex-col bg-white">
        {!selectedId && (
          <div className="flex flex-1 items-center justify-center text-sm text-[#616161]">
            Select a ticket to view the conversation.
          </div>
        )}

        {selectedId && loadingTicket && (
          <div className="flex flex-1 items-center justify-center text-sm text-[#616161]">Loading ticket…</div>
        )}

        {selectedId && !loadingTicket && ticketError && (
          <div className="flex flex-1 items-center justify-center text-sm text-red-600">{ticketError}</div>
        )}

        {selectedId && !loadingTicket && !ticketError && ticket && (
          <>
            <div className="border-b border-[#B8D8F5] bg-[#EAF4FF] px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#0F6CBD]">{ticket.category}</p>
                  <h2 className="mt-1 text-base font-semibold text-[#242424]">{ticket.subject || "Untitled ticket"}</h2>
                </div>
                <StatusBadge status={ticket.status} />
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#424242]">{ticket.description}</p>
              {ticket.attachmentUrl && (
                <a href={ticket.attachmentUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ticket.attachmentUrl} alt="Ticket attachment" className="max-h-10 rounded-md border border-[#E1DFDD]" />
                </a>
              )}
              <p className="mt-2 text-xs text-[#616161]">Opened {new Date(ticket.createdAt).toLocaleString()}</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {ticket.replies.map((r) => (
                <div key={r.id} className=" px-6 py-3">
                  <ChatBubble
                    reply={r}
                    isOwn={r.senderRole === "ADMIN"}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>

            {ticket.status === "SOLVED" ? (
              <div className="border-t border-[#E1DFDD] bg-[#F0FDF4] px-6 py-4">
                <p className="text-sm font-semibold text-emerald-800">This conversation is solved</p>
                <p className="mt-0.5 text-xs text-emerald-700">
                  Replies are disabled. Change the ticket status to Open or Processing to continue the conversation.
                </p>
              </div>
            ) : (
              <div className="border-t border-[#E1DFDD] bg-[#FAF9F8] px-3 py-3">
                <ReplyComposer onSend={handleSend} sending={sending} placeholder="Reply to patient…" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Right: patient / status info pane */}
      {selectedId && ticket && !loadingTicket && !ticketError && (
        <aside className="w-72 shrink-0 space-y-4 overflow-y-auto border-l border-[#E1DFDD] bg-[#FAF9F8] p-5">
          <div>
            <p className="text-sm font-medium text-[#242424]">{ticket.userName}</p>
            <p className="mt-0.5 text-xs text-[#616161]">{ticket.userEmail}</p>
            <p className="mt-0.5 text-xs text-[#9A9A9A]">ID: {ticket.userId}</p>
            <p className="mt-0.5 text-xs text-[#616161]">{ticket.contactNumber}</p>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#616161]">Status</h3>
            <div className="space-y-1.5">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={updatingStatus}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                    ticket.status === s
                      ? "bg-[#0052CC] text-white"
                      : "bg-white text-[#616161] hover:bg-[#F0F6FC]"
                  }`}
                >
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {ticket.attachmentUrl && (
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#616161]">Attachment</h3>
              <a href={ticket.attachmentUrl} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ticket.attachmentUrl}
                  alt="Ticket attachment"
                  className="rounded-md border border-[#E1DFDD]"
                />
              </a>
            </div>
          )}
      

          <div className="border-t border-[#E1DFDD] pt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#616161]">Patient feedback</h3>
            {ticket.feedback ? (
              <div className="rounded-md border border-[#E1DFDD] bg-white p-3">
                <div className="flex items-center gap-1" aria-label={`${ticket.feedback.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <span
                      key={value}
                      className={`text-lg leading-none ${
                        value <= ticket.feedback!.rating ? "text-amber-500" : "text-[#D6D3D1]"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-1 text-xs text-[#616161]">{ticket.feedback.rating}/5</span>
                </div>
                {ticket.feedback.comment && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[#424242]">{ticket.feedback.comment}</p>
                )}
                {ticket.feedback.createdAt && (
                  <p className="mt-2 text-[11px] text-[#9A9A9A]">
                    Submitted {new Date(ticket.feedback.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#9A9A9A]">No feedback submitted.</p>
            )}

            

          </div>
        </aside>
      )}
    </div>
  );
}