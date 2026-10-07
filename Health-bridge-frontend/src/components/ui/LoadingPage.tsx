"use client";

import React from "react";
import { Shield } from "lucide-react";

export interface LoadingPageProps {
  message?: string;
  systemName?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  message = "LOADING...",
  systemName = "Smart Healthcare Management System",
}) => {
  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Soft Radial Blue Glow Accents (matching Image 2) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-cyan-100/40 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-blue-100/40 blur-[120px] pointer-events-none" />

      {/* Centered White Loading Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-8 sm:p-10 w-full max-w-[380px] text-center flex flex-col items-center gap-4 relative z-10">
        {/* Shield Icon Container */}
        <div className="w-16 h-16 rounded-full bg-[#EBF3FF] flex items-center justify-center text-[#0052CC] mb-1">
          <div className="relative flex items-center justify-center">
            <Shield className="w-10 h-10 fill-[#0052CC] text-[#0052CC]" />
            <svg
              className="w-4 h-4 text-white absolute inset-0 m-auto fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z" />
            </svg>
          </div>
        </div>

        {/* System Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-[#0A2540] tracking-tight">
            Health Bridge
          </h1>
          <p className="text-xs font-medium text-slate-500">
            {systemName}
          </p>
        </div>

        {/* Solid Blue Animated Progress Bar (matching Image 2) */}
        <div className="w-44 h-1.5 bg-slate-100 rounded-full overflow-hidden relative my-2">
          <div className="h-full bg-[#0052CC] rounded-full w-2/3 animate-[loadingBar_1.5s_ease-in-out_infinite]" />
        </div>

        {/* Loading Caption */}
        <p className="text-[10px] font-semibold text-slate-400 tracking-[0.2em] uppercase">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingPage;
