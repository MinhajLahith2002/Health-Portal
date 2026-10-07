"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getMyTickets,
  getMyTicketById,
  createTicket,
  replyAsUser,
  submitTicketFeedback,
  editReplyAsUser,
  deleteReplyAsUser,
} from "@/services/supportService";
import { Ticket, TicketSummary } from "@/types/support";
import StatusBadge from "@/components/support/StatusBadge";
import CreateTicketModal from "@/components/support/CreateTicketModal";
import ChatBubble from "@/components/support/ChatBubble";
import ReplyComposer from "@/components/support/ReplyComposer";
import { PlusIcon } from "@/components/support/icons";
import Navbar from "@/components/ui/Navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function formatListDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "numeric" });
}

export default function MyTicketsPage() {
   const searchParams = useSearchParams();
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");

  const loadList = async () => {
    setLoadingList(true);
    setListError(null);
    try {
     const data = await getMyTickets();

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
      setListError(e instanceof Error ? e.message : "Failed to load tickets.");
    } finally {
      setLoadingList(false);
    }
  };

  const loadTicket = async (id: string) => {
    setLoadingTicket(true);
    setTicketError(null);
    try {
      const data = await getMyTicketById(id);
      setTicket(data);
      setFeedbackRating(data.feedback?.rating ?? 0);
      setFeedbackComment(data.feedback?.comment ?? "");
      setFeedbackError(null);
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

  const handleCreate = async (
    subject: string,
    description: string,
    category: string,
    contactNumber: string,
    attachment: File | null
  ) => {
    const createdTicket = await createTicket(
      subject,
      description,
      category,
      contactNumber,
      attachment
    );
    await loadList();
    setSelectedId(createdTicket.id);
  };

  const handleSend = async (message: string, image: File | null) => {
    if (!selectedId) return;
    setSending(true);
    try {
      const updated = await replyAsUser(selectedId, message, image);
      setTicket(updated);
      await loadList();
    } finally {
      setSending(false);
    }
  };

  const handleFeedbackSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedId || !feedbackRating || ticket?.feedback) return;

    setSubmittingFeedback(true);
    setFeedbackError(null);
    try {
      const updated = await submitTicketFeedback(selectedId, feedbackRating, feedbackComment.trim());
      setTicket(updated);
      await loadList();
    } catch (e) {
      setFeedbackError(e instanceof Error ? e.message : "Failed to submit feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleEdit = async (replyId: string, message: string) => {
    if (!selectedId) return;
    const updated = await editReplyAsUser(selectedId, replyId, message);
    setTicket(updated);
    await loadList();
  };

  const handleDelete = async (replyId: string) => {
    if (!selectedId) return;
    const updated = await deleteReplyAsUser(selectedId, replyId);
    setTicket(updated);
    await loadList();
  };

  const filteredTickets = useMemo(() => {
    if (!query.trim()) return tickets;
    const q = query.toLowerCase();
    return tickets.filter((t) => (t.subject || "").toLowerCase().includes(q));
  }, [tickets, query]);

  return (
      <div className="min-h-screen bg-slate-50">
      {/* Navbar spans full width, on top */}
   
    <div
      className="flex h-screen bg-white text-[#242424]"
      style={{ fontFamily: "'Segoe UI', Roboto, system-ui, sans-serif" }}
    >

  
      {/* Left: message list pane */}
      <div className="flex w-[380px] shrink-0 flex-col border-r border-[#E1DFDD] bg-white">
        <div className="flex items-center justify-between border-b border-[#E1DFDD] px-4 pt-3">
  {/* Back Button */}
  <button
    onClick={() => window.history.back()}
    className="inline-flex items-center rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
    aria-label="Go back"
  >
    <ArrowLeft size={20} />
  </button>

  {/* Title */}
  <span className="border-b-2 border-[#0F6CBD] pb-3 text-sm font-medium text-[#242424]">
    All Tickets
  </span>

  {/* New Ticket Button */}
  <Link
    href="/support/patient/sdefault"
    className="mb-1 inline-flex items-center rounded-lg bg-[#0052CC] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0F6CBD] focus:ring-offset-2"
  >
    + New Ticket
  </Link>
</div>

        <div className="px-3 py-2">
          <div className="flex items-center gap-2 rounded-md bg-[#F5F5F5] px-3 py-1.5">
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-[#9A9A9A]" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.4" />
              <path d="m14 14 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tickets"
              className="w-full bg-transparent text-sm text-[#242424] placeholder:text-[#9A9A9A] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingList && <p className="px-4 py-3 text-sm text-[#616161]">Loading tickets…</p>}
          {listError && <p className="px-4 py-3 text-sm text-red-600">{listError}</p>}

          {!loadingList && !listError && filteredTickets.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <p className="text-sm text-[#616161]">
                {tickets.length === 0 ? "You haven't raised any tickets yet." : "No tickets match your search."}
              </p>
              {tickets.length === 0 && (
                <button onClick={() => setModalOpen(true)} className="text-sm font-medium text-[#0F6CBD] hover:underline">
                  Raise your first ticket
                </button>
              )}
            </div>
          )}

          {filteredTickets.map((t) => {
            const isActive = t.id === selectedId;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`flex w-full items-start gap-3 border-b border-[#EDEBE9] px-4 py-3 text-left transition ${
                  isActive ? "bg-[#EBF3FC]" : "hover:bg-[#F5F5F5]"
                }`}
              >
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-[#242424]">{t.subject || "Untitled ticket"}</p>
                    <span className="shrink-0 text-xs text-[#616161]">{formatListDate(t.createdAt)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-[#616161]">
                    <StatusBadge status={t.status} />
                    {t.replyCount > 0 && <span>· {t.replyCount} repl{t.replyCount === 1 ? "y" : "ies"}</span>}
                    {t.hasAttachment && <span>· Attachment</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: reading pane */}
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
            <div className="border-b border-[#E1DFDD] px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-1">
  <p className="text-xs font-semibold uppercase tracking-wide text-[#0F6CBD]">
    {ticket.category}
  </p>

  <span className="text-xs font-semibold text-[#424242]">:</span>

  <h1 className="text-base font-semibold text-[#242424]">
    {ticket.subject || "Untitled ticket"}
  </h1>
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
                <div key={r.id} className=" px-6 py-2">
                  <ChatBubble
                    reply={r}
                    isOwn={r.senderRole === "USER"}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>

            {ticket.status === "SOLVED" ? (
              <div className="border-t border-[#E1DFDD] bg-[#F0FDF4] px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">This problem was solved</p>
                    <p className="mt-0.5 text-xs text-emerald-700">
                      This conversation is closed. Create a new ticket if you need more help.
                    </p>
                  </div>
               
                </div>

                <form onSubmit={handleFeedbackSubmit} className="mt-4 border-t border-emerald-200 pt-4">
                  <p className="text-sm font-semibold text-emerald-900">
                    {ticket.feedback ? "Your feedback" : "How was the support service?"}
                  </p>
                  <div className="mt-2 flex items-center gap-1" aria-label="Support rating">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-label={`${value} star${value === 1 ? "" : "s"}`}
                        onClick={() => setFeedbackRating(value)}
                        disabled={Boolean(ticket.feedback) || submittingFeedback}
                        className={`text-2xl leading-none transition ${
                          value <= feedbackRating ? "text-amber-500" : "text-emerald-300"
                        } ${ticket.feedback ? "cursor-default" : "hover:text-amber-500"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={feedbackComment}
                    onChange={(event) => setFeedbackComment(event.target.value)}
                    placeholder="Tell us about your support experience (optional)"
                    maxLength={1000}
                    disabled={Boolean(ticket.feedback) || submittingFeedback}
                    className="mt-3 min-h-20 w-full resize-y rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm text-[#242424] outline-none placeholder:text-[#7A8F82] focus:border-[#0F6CBD] disabled:bg-emerald-50"
                  />
                  {feedbackError && <p className="mt-2 text-xs text-red-600">{feedbackError}</p>}
                  {ticket.feedback ? (
                    <p className="mt-2 text-xs text-emerald-700">Thank you for your feedback.</p>
                  ) : (
                    <button
                      type="submit"
                      disabled={!feedbackRating || submittingFeedback}
                      className="mt-3 rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submittingFeedback ? "Submitting…" : "Submit feedback"}
                    </button>
                  )}
                </form>
              </div>
            ) : (
              <div className="border-t border-[#E1DFDD] bg-[#FAF9F8] px-3 py-3">
                <ReplyComposer onSend={handleSend} sending={sending} placeholder="Reply to support…" />
              </div>
            )}
          </>
        )}
      </div>

    </div>
    </div>
  );
}