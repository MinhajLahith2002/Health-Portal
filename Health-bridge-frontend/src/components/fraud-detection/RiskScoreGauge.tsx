"use client";

import { Info } from "lucide-react";

interface RiskScoreGaugeProps {
  score: number;
  label: string;
}

const BANDS = [
  { max: 25, name: "Low", color: "#facc15" },
  { max: 50, name: "Medium", color: "#f97316" },
  { max: 75, name: "High", color: "#ef4444" },
  { max: 100, name: "Critical", color: "#881337" },
] as const;

const bandFor = (score: number) => BANDS.find((band) => score <= band.max) ?? BANDS[BANDS.length - 1];

// Semicircle drawn as an SVG arc; dash offset controls how much of it is filled.
const RADIUS = 80;
const ARC_LENGTH = Math.PI * RADIUS;

export default function RiskScoreGauge({ score, label }: RiskScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const band = bandFor(clamped);
  const filled = (clamped / 100) * ARC_LENGTH;

  return (
    <article className="rounded-2xl border border-[#e7e9ec] bg-white p-5 sm:p-6">
      <div className="flex items-center gap-1.5">
        <h2 className="text-sm font-semibold">Risk Score</h2>
        <Info className="h-3.5 w-3.5 text-[#9299a0]" />
      </div>
      <div className="relative mx-auto mt-4 w-full max-w-65">
        <svg viewBox="0 0 200 110" className="w-full">
          <path
            d="M 10 100 A 80 80 0 0 1 190 100"
            fill="none"
            stroke="#e7ebef"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 10 100 A 80 80 0 0 1 190 100"
            fill="none"
            stroke={band.color}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${ARC_LENGTH}`}
          />
        </svg>
        <div className="absolute inset-x-0 top-[52%] flex flex-col items-center">
          <span className="text-4xl font-bold text-[#16191d]">{Math.round(clamped)}</span>
          <span className="mt-1 text-xs font-semibold tracking-wide text-[#606a73]">{label}</span>
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-[#9299a0]">
          <span>0</span>
          <span>100</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[10px] text-[#606a73]">
        {BANDS.map((entry, index) => (
          <span key={entry.name} className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name} ({index === 0 ? 0 : BANDS[index - 1].max + 1}-{entry.max})
          </span>
        ))}
      </div>
    </article>
  );
}
