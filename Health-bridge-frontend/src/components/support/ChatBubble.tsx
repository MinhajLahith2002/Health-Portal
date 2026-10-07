"use client";

import { useState } from "react";
import { CheckIcon, EditIcon, TrashIcon, XIcon } from "./icons";
import { TicketReply } from "@/types/support";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatBubble({
  reply,
  isOwn,
  onEdit,
  onDelete,
}: {
  reply: TicketReply;
  isOwn: boolean;
  onEdit?: (replyId: string, message: string) => Promise<void>;
  onDelete?: (replyId: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(reply.message ?? "");
  const [busy, setBusy] = useState(false);
  const canManage = reply.id !== "original" && isOwn && Boolean(reply.message) && Boolean(onEdit) && Boolean(onDelete);

  const saveEdit = async () => {
    if (!onEdit || !draft.trim() || draft.trim() === reply.message) {
      setEditing(false);
      return;
    }
    setBusy(true);
    try {
      await onEdit(reply.id, draft.trim());
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const removeReply = async () => {
    if (!onDelete || !window.confirm("Delete this message?")) return;
    setBusy(true);
    try {
      await onDelete(reply.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[75%] flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2 px-1 text-xs text-slate-400">
          <span>  {formatTime(reply.createdAt)}</span>
          {canManage && !editing && (
            <span className="flex items-center gap-1">
              <button type="button" onClick={() => setEditing(true)} disabled={busy} title="Edit message" aria-label="Edit message" className="rounded p-1 hover:bg-slate-100 hover:text-slate-700">
                <EditIcon className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={removeReply} disabled={busy} title="Delete message" aria-label="Delete message" className="rounded p-1 hover:bg-red-50 hover:text-red-600">
                <TrashIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
        </div>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isOwn
              ? "rounded-br-sm bg-[#0052CC] text-white"
              : "rounded-bl-sm border border-slate-200 bg-[#F4F5F7] text-slate-800"
          }`}
        >
          {editing ? (
            <div className="min-w-56 space-y-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={3}
                autoFocus
                disabled={busy}
                className="w-full resize-none rounded-lg border border-white/50 bg-white/10 px-2 py-1.5 text-sm text-inherit outline-none placeholder:text-white/70"
              />
              <div className="flex justify-end gap-1">
                <button type="button" onClick={() => { setDraft(reply.message ?? ""); setEditing(false); }} disabled={busy} title="Cancel edit" aria-label="Cancel edit" className="rounded p-1 hover:bg-white/15">
                  <XIcon className="h-4 w-4" />
                </button>
                <button type="button" onClick={saveEdit} disabled={busy || !draft.trim()} title="Save message" aria-label="Save message" className="rounded p-1 hover:bg-white/15">
                  <CheckIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : reply.message ? <p className="whitespace-pre-wrap">{reply.message}</p> : null}
          {reply.imageUrl && (
            <a href={reply.imageUrl} target="_blank" rel="noreferrer" className="mt-2 block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={reply.imageUrl}
                alt="Attached"
                className="max-h-56 rounded-lg border border-white/20 object-cover"
              />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
