"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { telemedicineApi } from "@/features/telemedicine/api/telemedicineApi";
import { useWebRTC } from "@/features/telemedicine/hooks/useWebRTC";
import { WaitingRoomCard } from "@/features/telemedicine/components/WaitingRoomCard";
import type { TelemedicineSession } from "@/features/telemedicine/types";
import { useAuth } from "@/hooks/useAuth";

export default function WaitingRoomPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const sessionId = searchParams.get("sessionId") ?? undefined;

  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [enterError, setEnterError] = useState<string | null>(null);

  const role: "PATIENT" | "DOCTOR" = user?.role === "DOCTOR" ? "DOCTOR" : "PATIENT";
  const isInitiator = role === "PATIENT";

  const {
    localStream,
    peerJoined,
    isMicMuted,
    isCameraOff,
    callState,
    start,
    toggleMic,
    toggleCamera,
  } = useWebRTC({
    roomCode: session?.roomCode ?? "",
    userId: user?.id ?? "",
    signalingUrl: session ? buildWsUrl(session.signalingUrl) : "",
    consultationType: session?.consultationType ?? "VIDEO",
    isInitiator,
  });

  useEffect(() => {
    if (!sessionId || !user) return;

    let cancelled = false;

    (async () => {
      try {
        const fetched = await telemedicineApi.getSession(sessionId);
        if (cancelled) return;
        setSession(fetched);

        await telemedicineApi.enterWaitingRoom(sessionId, { userId: user.id, role });
      } catch (err) {
        if (!cancelled) setError("Could not load this consultation. It may no longer be available.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, user?.id]);

  useEffect(() => {
    if (session && callState === "idle") {
      void start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const handleEnterCall = async () => {
    if (!sessionId || !user) return;
    setEnterError(null);
    try {
      await telemedicineApi.joinSession(sessionId, { userId: user.id, role });
      router.push(`/telemedicine/video-room/${sessionId}`);
    } catch {
      setEnterError("Could not join the call. The consultation may have ended - please go back and try again.");
    }
  };

  if (loading) {
    return <CenteredMessage text="Preparing your consultation room..." />;
  }

  if (error || !session) {
    return <CenteredMessage text={error ?? "Consultation not found."} isError />;
  }

  return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-10">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            {session.consultationType === "VIDEO" ? "Video" : "Audio"} Consultation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Scheduled for {new Date(session.scheduledStartTime).toLocaleString()}
          </p>
        </div>

        <WaitingRoomCard
            localStream={localStream}
            isMicMuted={isMicMuted}
            isCameraOff={isCameraOff}
            isAudioOnly={session.consultationType === "AUDIO"}
            peerJoined={peerJoined}
            counterpartLabel={role === "PATIENT" ? "your doctor" : "the patient"}
            onToggleMic={toggleMic}
            onToggleCamera={toggleCamera}
            onEnterCall={handleEnterCall}
        />
        {enterError && <p className="mt-4 text-sm text-red-600 text-center max-w-md">{enterError}</p>}
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

function CenteredMessage({ text, isError = false }: { text: string; isError?: boolean }) {
  return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className={`text-sm ${isError ? "text-red-600" : "text-slate-500"}`}>{text}</p>
      </div>
  );
}