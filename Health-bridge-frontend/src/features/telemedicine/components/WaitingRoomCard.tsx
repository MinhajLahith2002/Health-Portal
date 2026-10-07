"use client";

import { Loader2, Mic, MicOff, Video, VideoOff } from "lucide-react";

interface WaitingRoomCardProps {
  localStream: MediaStream | null;
  isMicMuted: boolean;
  isCameraOff: boolean;
  isAudioOnly: boolean;
  peerJoined: boolean;
  counterpartLabel: string;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onEnterCall: () => void;
}

export function WaitingRoomCard({
  localStream,
  isMicMuted,
  isCameraOff,
  isAudioOnly,
  peerJoined,
  counterpartLabel,
  onToggleMic,
  onToggleCamera,
  onEnterCall,
}: WaitingRoomCardProps) {
  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Ready to join?</h2>
      <p className="text-sm text-slate-500 mb-4">
        {peerJoined ? `${counterpartLabel} is already in the room.` : `Waiting for ${counterpartLabel} to join...`}
      </p>

      {!isAudioOnly && (
        <div className="relative w-full aspect-video rounded-xl bg-slate-900 overflow-hidden mb-4 flex items-center justify-center">
          {localStream && !isCameraOff ? (
            <LocalPreview stream={localStream} />
          ) : (
            <span className="text-slate-400 text-sm">Camera off</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-center gap-3 mb-5">
        <button
          onClick={onToggleMic}
          className={`w-11 h-11 rounded-full flex items-center justify-center text-white ${
            isMicMuted ? "bg-red-500" : "bg-slate-700"
          }`}
          aria-label={isMicMuted ? "Unmute" : "Mute"}
        >
          {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        {!isAudioOnly && (
          <button
            onClick={onToggleCamera}
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white ${
              isCameraOff ? "bg-red-500" : "bg-slate-700"
            }`}
            aria-label={isCameraOff ? "Turn camera on" : "Turn camera off"}
          >
            {isCameraOff ? <VideoOff size={18} /> : <Video size={18} />}
          </button>
        )}
      </div>

      <button
        onClick={onEnterCall}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2"
      >
        {!peerJoined && <Loader2 className="animate-spin" size={16} />}
        Join consultation
      </button>
    </div>
  );
}

function LocalPreview({ stream }: { stream: MediaStream }) {
  return (
    <video
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover scale-x-[-1]"
      ref={(el) => {
        if (el) el.srcObject = stream;
      }}
    />
  );
}
