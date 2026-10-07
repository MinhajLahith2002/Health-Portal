"use client";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  ScreenShareOff,
  PhoneOff,
  MessageSquare,
} from "lucide-react";

interface CallControlsProps {
  isMicMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isAudioOnly: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onHangUp: () => void;
  onToggleChat: () => void;
  unreadChatCount?: number;
}

export function CallControls({
  isMicMuted,
  isCameraOff,
  isScreenSharing,
  isAudioOnly,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onHangUp,
  onToggleChat,
  unreadChatCount = 0,
}: CallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-slate-800/90 backdrop-blur">
      <ControlButton
        onClick={onToggleMic}
        active={isMicMuted}
        activeColor="bg-red-500"
        label={isMicMuted ? "Unmute" : "Mute"}
      >
        {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
      </ControlButton>

      {!isAudioOnly && (
        <ControlButton
          onClick={onToggleCamera}
          active={isCameraOff}
          activeColor="bg-red-500"
          label={isCameraOff ? "Start video" : "Stop video"}
        >
          {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
        </ControlButton>
      )}

      {!isAudioOnly && (
        <ControlButton
          onClick={onToggleScreenShare}
          active={isScreenSharing}
          activeColor="bg-blue-500"
          label={isScreenSharing ? "Stop sharing" : "Share screen"}
        >
          {isScreenSharing ? <ScreenShareOff size={20} /> : <ScreenShare size={20} />}
        </ControlButton>
      )}

      <div className="relative">
        <ControlButton onClick={onToggleChat} label="Chat">
          <MessageSquare size={20} />
        </ControlButton>
        {unreadChatCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-semibold">
            {unreadChatCount}
          </span>
        )}
      </div>

      <button
        onClick={onHangUp}
        aria-label="End call"
        className="w-14 h-12 rounded-full bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center text-white"
      >
        <PhoneOff size={20} />
      </button>
    </div>
  );
}

function ControlButton({
  children,
  onClick,
  active = false,
  activeColor = "bg-red-500",
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  activeColor?: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors text-white ${
        active ? activeColor : "bg-slate-700 hover:bg-slate-600"
      }`}
    >
      {children}
    </button>
  );
}
