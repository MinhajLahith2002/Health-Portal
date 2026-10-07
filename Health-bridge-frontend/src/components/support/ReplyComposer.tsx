"use client";

import { useRef, useState } from "react";
import { PaperclipIcon, SendIcon, XIcon } from "./icons";

export default function ReplyComposer({
  onSend,
  sending,
  placeholder = "Type a message…",
}: {
  onSend: (message: string, image: File | null) => Promise<void> | void;
  sending: boolean;
  placeholder?: string;
}) {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!message.trim() && !image) return;
    await onSend(message.trim(), image);
    setMessage("");
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="border-t border-slate-200 bg-white p-3">
      {image && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <span className="truncate">{image.name}</span>
          <button
            type="button"
            onClick={() => {
              setImage(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="ml-auto text-slate-400 hover:text-slate-600"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach image"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <PaperclipIcon className="h-5 w-5" />
        </button>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={placeholder}
          rows={1}
          className="min-h-[42px] max-h-32 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || (!message.trim() && !image)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0052CC] text-white transition hover:bg-[#0052CC]-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
