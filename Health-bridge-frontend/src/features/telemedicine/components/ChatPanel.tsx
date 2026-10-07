"use client";

import { useState } from "react";
import { Send, X } from "lucide-react";

interface ChatMessage {
  senderId: string;
  text: string;
  timestamp: number;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSend: (text: string) => void;
  onClose: () => void;
}

export function ChatPanel({ messages, currentUserId, onSend, onClose }: ChatPanelProps) {
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft("");
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-xl shadow-lg border border-slate-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <span className="font-semibold text-slate-800">In-call chat</span>
        <button onClick={onClose} aria-label="Close chat" className="text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-sm text-slate-400 text-center mt-8">No messages yet</p>
        )}
        {messages.map((msg, idx) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <div key={idx} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                  isMine ? "bg-blue-600 text-white rounded-br-sm" : "bg-slate-100 text-slate-800 rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-200">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-full border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSend}
          aria-label="Send message"
          className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
