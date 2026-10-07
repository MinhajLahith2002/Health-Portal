"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SignalingMessage } from "../types";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  // Add TURN server(s) here for production (required behind restrictive NATs):
  // { urls: "turn:turn.yourdomain.com:3478", username: "...", credential: "..." },
];

export type CallState = "idle" | "connecting" | "connected" | "disconnected" | "failed";

interface UseWebRTCOptions {
  roomCode: string;
  userId: string;
  signalingUrl: string;
  consultationType: "VIDEO" | "AUDIO";
  /** true for the participant who initiates the offer (e.g. the patient) */
  isInitiator: boolean;
}

interface ChatMessage {
  senderId: string;
  text: string;
  timestamp: number;
}

export function useWebRTC({ roomCode, userId, signalingUrl, consultationType, isInitiator }: UseWebRTCOptions) {
  const [callState, setCallState] = useState<CallState>("idle");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [peerJoined, setPeerJoined] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const startedRef = useRef(false);

  const sendSignal = useCallback((type: SignalingMessage["type"], payload?: unknown) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const message: SignalingMessage = {
      type,
      senderId: userId,
      roomCode,
      payload: payload !== undefined ? JSON.stringify(payload) : undefined,
    };
    ws.send(JSON.stringify(message));
  }, [roomCode, userId]);

  const createPeerConnection = useCallback((stream: MediaStream) => {
    // Always start from a clean connection: a stale one (from an earlier peer) cannot be re-used.
    pcRef.current?.close();
    pendingCandidatesRef.current = [];
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal("ice-candidate", event.candidate.toJSON());
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      switch (pc.connectionState) {
        case "connected":
          setCallState("connected");
          break;
        case "disconnected":
          setCallState("disconnected");
          break;
        case "failed":
          setCallState("failed");
          break;
        default:
          break;
      }
    };

    pcRef.current = pc;
    return pc;
  }, [sendSignal]);

  const flushPendingCandidates = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    while (pendingCandidatesRef.current.length > 0) {
      const candidate = pendingCandidatesRef.current.shift();
      if (candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    }
  }, []);

  const handleSignalingMessage = useCallback(async (message: SignalingMessage) => {
    const pc = pcRef.current;

    switch (message.type) {
      case "peer-joined":
        setPeerJoined(true);
        if (isInitiator && localStreamRef.current) {
          // A (re)joining peer needs a brand-new connection, otherwise the offer targets a dead transport.
          const fresh = createPeerConnection(localStreamRef.current);
          const offer = await fresh.createOffer();
          await fresh.setLocalDescription(offer);
          sendSignal("offer", offer);
        }
        break;

      case "peer-left":
        setPeerJoined(false);
        setRemoteStream(null);
        setCallState("disconnected");
        // Get ready for the peer coming back (e.g. moving from waiting room to the call room).
        if (localStreamRef.current) createPeerConnection(localStreamRef.current);
        break;

      case "offer": {
        if (!message.payload || !localStreamRef.current) return;
        const offer = JSON.parse(message.payload) as RTCSessionDescriptionInit;
        const answerer = pc && pc.signalingState === "stable" && !pc.remoteDescription ? pc : createPeerConnection(localStreamRef.current);
        await answerer.setRemoteDescription(new RTCSessionDescription(offer));
        await flushPendingCandidates();
        const answer = await answerer.createAnswer();
        await answerer.setLocalDescription(answer);
        sendSignal("answer", answer);
        break;
      }

      case "answer": {
        if (!pc || !message.payload) return;
        const answer = JSON.parse(message.payload) as RTCSessionDescriptionInit;
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await flushPendingCandidates();
        break;
      }

      case "ice-candidate": {
        if (!message.payload) return;
        const candidate = JSON.parse(message.payload) as RTCIceCandidateInit;
        if (pc && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          pendingCandidatesRef.current.push(candidate);
        }
        break;
      }

      case "chat": {
        if (!message.payload) return;
        const text = JSON.parse(message.payload) as string;
        setChatMessages((prev) => [...prev, { senderId: message.senderId, text, timestamp: Date.now() }]);
        break;
      }

      default:
        break;
    }
  }, [createPeerConnection, flushPendingCandidates, isInitiator, sendSignal]);

  const start = useCallback(async () => {
    // React StrictMode runs effects twice in dev; without this we would open two sockets/cameras.
    if (startedRef.current) return;
    startedRef.current = true;
    setCallState("connecting");

    const constraints: MediaStreamConstraints =
        consultationType === "VIDEO" ? { video: true, audio: true } : { video: false, audio: true };

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      startedRef.current = false;
      setCallState("failed");
      throw err;
    }
    localStreamRef.current = stream;
    setLocalStream(stream);
    cameraTrackRef.current = stream.getVideoTracks()[0] ?? null;

    createPeerConnection(stream);

    const ws = new WebSocket(signalingUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message: SignalingMessage = JSON.parse(event.data);
      void handleSignalingMessage(message);
    };

    ws.onclose = () => {
      setCallState((prev) => (prev === "connected" ? "disconnected" : prev));
    };

    ws.onerror = () => {
      setCallState("failed");
    };
  }, [consultationType, createPeerConnection, handleSignalingMessage, signalingUrl]);

  const hangUp = useCallback(() => {
    sendSignal("peer-left");
    pcRef.current?.close();
    pcRef.current = null;
    wsRef.current?.close();
    wsRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    startedRef.current = false;
    setLocalStream(null);
    setRemoteStream(null);
    setCallState("idle");
  }, [sendSignal]);

  const toggleMic = useCallback(() => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicMuted(!audioTrack.enabled);
    }
  }, [localStream]);

  const toggleCamera = useCallback(() => {
    if (!localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOff(!videoTrack.enabled);
    }
  }, [localStream]);

  const toggleScreenShare = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;

    if (!isScreenSharing) {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) await sender.replaceTrack(screenTrack);

      screenTrack.onended = () => {
        void toggleScreenShare();
      };

      setIsScreenSharing(true);
      sendSignal("screen-share-toggle", { active: true });
    } else {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender && cameraTrackRef.current) {
        await sender.replaceTrack(cameraTrackRef.current);
      }
      setIsScreenSharing(false);
      sendSignal("screen-share-toggle", { active: false });
    }
  }, [isScreenSharing, sendSignal]);

  const sendChatMessage = useCallback((text: string) => {
    sendSignal("chat", text);
    setChatMessages((prev) => [...prev, { senderId: userId, text, timestamp: Date.now() }]);
  }, [sendSignal, userId]);

  useEffect(() => {
    return () => {
      pcRef.current?.close();
      wsRef.current?.close();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      startedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
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
  };
}