"use client";

import { useEffect, useState } from "react";
import {
  Users,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  Activity,
  UserPlus,
  Stethoscope,
  Zap,
  Lock,
  ArrowUpRight,
  HeartPulse,
} from "lucide-react";

interface MemberActivity {
  id: string;
  name: string;
  role: "Patient" | "Doctor" | "Specialist";
  action: string;
  location: string;
  time: string;
  initials: string;
  color: string;
  badge: string;
}

const LIVE_MEMBERS: MemberActivity[] = [
  {
    id: "1",
    name: "Kasun Perera",
    role: "Patient",
    action: "Joined & booked Dr. Senanayake",
    location: "Colombo",
    time: "Just now",
    initials: "KP",
    color: "from-blue-600 to-cyan-500",
    badge: "Cardiology Consult",
  },
  {
    id: "2",
    name: "Dr. Nilanthi Senanayake",
    role: "Specialist",
    action: "Welcomed 3 new consultations",
    location: "Kandy General",
    time: "1m ago",
    initials: "NS",
    color: "from-emerald-600 to-teal-500",
    badge: "Cardiologist",
  },
  {
    id: "3",
    name: "Amaya De Silva",
    role: "Patient",
    action: "Activated Family Care Vault",
    location: "Galle",
    time: "2m ago",
    initials: "AD",
    color: "from-indigo-600 to-blue-500",
    badge: "Digital Passport",
  },
  {
    id: "4",
    name: "Dr. Rohan Wickrama",
    role: "Doctor",
    action: "Opened 8 instant Telehealth slots",
    location: "Colombo",
    time: "4m ago",
    initials: "RW",
    color: "from-cyan-600 to-blue-600",
    badge: "Pediatrics",
  },
];

export default function RegisterIllustration({
  className = "",
}: {
  className?: string;
}) {
  const [activeUserIndex, setActiveUserIndex] = useState(0);
  const [joinedCount, setJoinedCount] = useState(1428);

  // Periodic member rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveUserIndex((prev) => (prev + 1) % LIVE_MEMBERS.length);
      setJoinedCount((c) => c + 1);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  const currentMember = LIVE_MEMBERS[activeUserIndex];

  return (
    <div
      className={`relative w-full max-w-[560px] min-h-[500px] p-3 flex flex-col justify-between select-none overflow-hidden rounded-3xl ${className}`}
    >
      {/* Background Soft Ambient Blur & Mesh Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/80 via-cyan-50/60 to-indigo-100/70 rounded-3xl -z-10 blur-xl opacity-90" />
      <div className="absolute inset-0 bg-white/75 backdrop-blur-xl rounded-3xl border border-blue-200/70 shadow-2xl shadow-blue-500/10 -z-10" />

      {/* Top Bar: Community Pulse & Live Counter */}
      <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-blue-100/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-800 tracking-tight flex items-center gap-1.5">
              <span>Live Patient Network</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <span>Verified Care Community</span>
              <span>•</span>
              <span className="text-blue-600 font-semibold">Active Now</span>
            </div>
          </div>
        </div>

        {/* Live Registrations Counter with subtle ticking animation */}
        <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 text-emerald-800 text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm transition-transform duration-300">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>{joinedCount.toLocaleString()}+ Joined</span>
        </div>
      </div>

      {/* Dynamic Centerpiece: Live Member Match & Welcome Pod */}
      <div className="my-3 flex flex-col gap-3">
        {/* Active Member Celebration Card */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 rounded-2xl p-4 text-white shadow-xl shadow-blue-600/25 relative overflow-hidden transition-all duration-500">
          {/* Animated background energy rings */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border-2 border-white/20 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none" />
          <div className="absolute -right-2 -bottom-2 w-20 h-20 bg-cyan-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              {/* Member Avatar with initials and glow */}
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${currentMember.color} border border-white/40 flex items-center justify-center text-sm font-extrabold text-white shadow-inner transition-transform duration-500 hover:scale-105`}
                >
                  {currentMember.initials}
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-blue-700 flex items-center justify-center shadow-xs">
                  <CheckCircle className="w-2.5 h-2.5 text-blue-900" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-tight">
                    {currentMember.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-bold uppercase tracking-wider backdrop-blur">
                    {currentMember.role}
                  </span>
                </div>
                <div className="text-[11px] text-cyan-100 mt-0.5 flex items-center gap-1 font-medium">
                  <UserPlus className="w-3 h-3 text-cyan-300" />
                  <span>{currentMember.action}</span>
                </div>
                <div className="text-[9px] text-blue-200 mt-0.5 flex items-center gap-1.5 font-mono">
                  <span>{currentMember.location}</span>
                  <span>•</span>
                  <span>{currentMember.time}</span>
                </div>
              </div>
            </div>

            {/* Glowing Action Tag */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="px-2.5 py-1 rounded-xl bg-white/20 border border-white/30 text-[10px] font-extrabold backdrop-blur shadow-sm">
                {currentMember.badge}
              </span>
              <span className="text-[9px] text-cyan-200 mt-1 flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-amber-300 animate-pulse" />
                Instant Connected
              </span>
            </div>
          </div>
        </div>

        {/* Live Stream Ticker List */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 p-3 shadow-md shadow-slate-200/50 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-blue-700">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-spin [animation-duration:8s]" />
              Recent Community Activity
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Live Stream</span>
          </div>

          <div className="space-y-1.5">
            {LIVE_MEMBERS.map((m, i) => {
              const isSelected = i === activeUserIndex;
              return (
                <div
                  key={m.id}
                  onClick={() => setActiveUserIndex(i)}
                  className={`px-3 py-2 rounded-xl transition-all duration-300 flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/90 border border-blue-200/80 shadow-xs scale-[1.01]"
                      : "bg-slate-50/60 border border-transparent hover:bg-slate-100/70 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${m.color} text-white flex items-center justify-center text-[10px] font-bold shadow-xs`}
                    >
                      {m.initials}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{m.name}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[220px]">
                        {m.action}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-medium text-slate-400">
                    {m.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Health Trust & Security */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl p-3.5 text-white shadow-xl flex items-center justify-between relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/30 via-transparent to-transparent pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-tight">
              Ready to Join the Care Hub?
            </div>
            <div className="text-[10px] text-blue-200 flex items-center gap-1 mt-0.5">
              <span>HIPAA Compliant • 256-Bit Encrypted Data</span>
            </div>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white backdrop-blur">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active</span>
        </div>
      </div>
    </div>
  );
}
