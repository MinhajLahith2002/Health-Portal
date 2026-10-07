"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { telemedicineApi } from "@/features/telemedicine/api/telemedicineApi";
import { useWebRTC } from "@/features/telemedicine/hooks/useWebRTC";
import { VideoTile } from "@/features/telemedicine/components/VideoTile";
import { CallControls } from "@/features/telemedicine/components/CallControls";
import { ChatPanel } from "@/features/telemedicine/components/ChatPanel";
import type { TelemedicineSession } from "@/features/telemedicine/types";
import { useAuth } from "@/hooks/useAuth";

export default function VideoRoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadChat, setUnreadChat] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [endingCall, setEndingCall] = useState(false);

  const role: "PATIENT" | "DOCTOR" = user?.role === "DOCTOR" ? "DOCTOR" : "PATIENT";
  const isInitiator = role === "PATIENT";

  const {
    callState,
    localStream,
    remoteStream,
    peerJoined,
    isMicMuted,
    isCameraOff,
    isScreenSharing,
    chatMessages,
    start,
    hangUp,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    sendChatMessage,
  } = useWebRTC({
    roomCode: session?.roomCode ?? "",
    userId: user?.id ?? "",
    signalingUrl: session ? buildWsUrl(session.signalingUrl) : "",
    consultationType: session?.consultationType ?? "VIDEO",
    isInitiator,
  });

  useEffect(() => {
    if (!id) return;
    telemedicineApi.getSession(id).then(setSession).catch(() => router.push("/telemedicine/history"));
  }, [id, router]);

  useEffect(() => {
    if (session && callState === "idle") {
      void start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (callState !== "connected") return;
    const interval = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [callState]);

  useEffect(() => {
    if (!isChatOpen && chatMessages.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnreadChat((prev) => prev + 1);
    }
  }, [chatMessages.length, isChatOpen]);

  const handleToggleScreenShare = async () => {
    await toggleScreenShare();
    if (session) {
      await telemedicineApi.markScreenSharingUsed(session.id).catch(() => undefined);
    }
  };

  const handleHangUp = async () => {
    if (!session || endingCall) return;
    setEndingCall(true);
    hangUp();
    try {
      await telemedicineApi.endSession(session.id, {
        requestAiSummary: true,
        screenSharingUsed: isScreenSharing,
      });
    } catch (err) {
      console.error("Failed to end telemedicine session", err);
    } finally {
      router.push(`/telemedicine/consultation-summary/${session.id}`);
    }
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
    setUnreadChat(0);
  };

  if (!session) {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <p className="text-slate-300 text-sm">Connecting to consultation...</p>
        </div>
    );
  }

  const isAudioOnly = session.consultationType === "AUDIO";

  return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-slate-200 text-sm">
            <span className={`w-2 h-2 rounded-full ${callState === "connected" ? "bg-green-400" : "bg-amber-400"}`} />
            {callState === "connected" ? formatDuration(elapsed) : connectingLabel(callState, peerJoined)}
          </div>
          <span className="text-slate-400 text-xs font-mono">Room {session.roomCode}</span>
        </div>

        <div className="flex-1 flex gap-4 px-6 pb-4 min-h-0">
          <div className={`flex-1 grid ${isAudioOnly ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"} gap-4 min-h-0`}>
            <VideoTile
                stream={remoteStream}
                label={role === "PATIENT" ? "Doctor" : "Patient"}
                isCameraOff={isAudioOnly || !remoteStream}
            />
            {!isAudioOnly && (
                <VideoTile stream={localStream} label="You" muted isCameraOff={isCameraOff} isLocal />
            )}
          </div>

          {isChatOpen && (
              <div className="w-80 hidden lg:block">
                <ChatPanel
                    messages={chatMessages}
                    currentUserId={user?.id ?? ""}
                    onSend={sendChatMessage}
                    onClose={() => setIsChatOpen(false)}
                />
              </div>
          )}
        </div>

        <div className="pb-8 flex justify-center">
          <CallControls
              isMicMuted={isMicMuted}
              isCameraOff={isCameraOff}
              isScreenSharing={isScreenSharing}
              isAudioOnly={isAudioOnly}
              onToggleMic={toggleMic}
              onToggleCamera={toggleCamera}
              onToggleScreenShare={handleToggleScreenShare}
              onHangUp={handleHangUp}
              onToggleChat={isChatOpen ? () => setIsChatOpen(false) : handleOpenChat}
              unreadChatCount={unreadChat}
          />
        </div>
      </div>
  );
}

function buildWsUrl(path: string): string {
  if (path.startsWith("ws://") || path.startsWith("wss://")) return path;
  // Point at the backend host (services/apiClient.ts's base), not the Next.js dev server.
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8088/api";
  const backendOrigin = apiBase.replace(/\/api\/?$/, "");
  const wsOrigin = backendOrigin.replace(/^http/, "ws");
  return `${wsOrigin}${path}`;
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function connectingLabel(callState: string, peerJoined: boolean): string {
  if (callState === "failed") return "Connection failed";
  if (callState === "disconnected") return "Call ended";
  return peerJoined ? "Connecting..." : "Waiting for the other participant...";
}