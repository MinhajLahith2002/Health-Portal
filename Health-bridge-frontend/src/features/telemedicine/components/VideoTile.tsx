"use client";

import { useEffect, useRef } from "react";

interface VideoTileProps {
  stream: MediaStream | null;
  muted?: boolean;
  label: string;
  isCameraOff?: boolean;
  isLocal?: boolean;
}

export function VideoTile({ stream, muted = false, label, isCameraOff = false, isLocal = false }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
      {stream && !isCameraOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className={`w-full h-full object-cover ${isLocal ? "scale-x-[-1]" : ""}`}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-semibold text-slate-200">
            {label.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm">{isCameraOff ? "Camera off" : "Waiting for video..."}</span>
        </div>
      )}
      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/50 text-white text-xs font-medium">
        {label}
      </div>
    </div>
  );
}
