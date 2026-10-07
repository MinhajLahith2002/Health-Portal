"use client";

import { useState, useRef } from "react";

export default function EmergencySOSPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activated, setActivated] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const HOLD_DURATION = 3000;

  const handleMouseDown = () => {
    setIsHolding(true);
    setProgress(0);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current || Date.now());
      const currentProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(currentProgress);

      if (elapsed >= HOLD_DURATION) {
        if (timerRef.current) clearInterval(timerRef.current);
        setActivated(true);
        setTimeout(() => setActivated(false), 3000);
      }
    }, 16);
  };

  const handleMouseUp = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsHolding(false);
    if (progress < 100) setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Emergency SOS</h1>
          <p className="mt-2 text-lg text-gray-600">
            Request immediate medical assistance and notify your emergency contacts
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - SOS Button & Type Selection */}
          <div className="space-y-8 lg:col-span-2">
            {/* SOS Button Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg">
              <div className="flex flex-col items-center gap-8">
                {/* Button Container */}
                <div className="relative h-56 w-56">
                  {/* Glow Background */}
                  <div className="absolute inset-0 rounded-full bg-red-100 blur-2xl opacity-30" />

                  {/* Progress Ring */}
                  <svg className="absolute inset-0 h-full w-full -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="100"
                      stroke="rgb(239, 68, 68)"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 100}`}
                      strokeDashoffset={`${2 * Math.PI * 100 * (1 - progress / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-100"
                    />
                  </svg>

                  {/* Main Button */}
                  <button
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchEnd={handleMouseUp}
                    className={`absolute inset-0 m-auto flex h-48 w-48 flex-col items-center justify-center rounded-full bg-red-500 font-bold text-white shadow-lg transition-all ${
                      isHolding
                        ? "scale-95 shadow-2xl shadow-red-500/50"
                        : "scale-100 hover:scale-105"
                    }`}
                  >
                    <div className="text-5xl">SOS</div>
                    <div className="mt-2 text-center text-xs font-semibold leading-tight">
                      HOLD FOR
                      <br />
                      3 SECONDS
                    </div>
                  </button>
                </div>

                <p className="text-center text-sm text-gray-600">
                  Press and hold to prevent accidental emergency requests
                </p>
              </div>
            </div>

            {/* Emergency Type Selector */}
            <div>
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Specific Emergency Type
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { id: "chest", label: "Chest Pain", icon: "❤️" },
                  { id: "breathing", label: "Breathing Issue", icon: "🫁" },
                  { id: "injury", label: "Severe Injury", icon: "🩹" },
                  { id: "other", label: "Other", icon: "⚠️" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`rounded-lg border-2 p-6 transition-all ${
                      selectedType === type.id
                        ? "border-red-500 bg-red-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="text-3xl">{type.icon}</div>
                    <div className="mt-2 font-semibold text-gray-900">
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                Patient Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500">PATIENT</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    Sarah Johnson
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">
                    PATIENT ID
                  </p>
                  <p className="mt-1 font-mono text-sm text-gray-700">
                    PT-2026-00458
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">RISK</p>
                  <p className="mt-1 inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                    MODERATE RISK
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">
                    BLOOD TYPE
                  </p>
                  <p className="mt-1 text-lg font-bold text-gray-900">O+</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">
                    ALLERGIES
                  </p>
                  <p className="mt-1 text-sm text-red-700">Penicillin</p>
                </div>
              </div>
            </div>

            {/* Current Location */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                Current Location
              </h3>
              <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-blue-50">
                <div className="text-center">
                  <div className="text-3xl">📍</div>
                  <p className="mt-1 text-xs text-blue-600">Location Ready</p>
                </div>
              </div>
              <p className="text-sm text-gray-900">123 Main Street</p>
              <p className="text-sm text-gray-900">Colombo 07, Sri Lanka</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs text-green-700">High Accuracy</span>
              </div>
            </div>

            {/* ETA */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold text-gray-500">EST. ARRIVAL</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">8–12 mins</p>
            </div>

            {/* Emergency Contacts */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                Emergency Contacts
              </h3>
              <div className="space-y-3">
                {[
                  { name: "John Johnson", rel: "Husband" },
                  { name: "Emily Johnson", rel: "Sister" },
                ].map((contact, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {contact.name}
                      </p>
                      <p className="text-xs text-gray-600">{contact.rel}</p>
                    </div>
                    <button className="text-lg">☎️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activation Message */}
        {activated && (
          <div className="fixed bottom-6 right-6 rounded-lg border border-green-200 bg-green-50 px-6 py-4 shadow-lg">
            <div className="font-semibold text-green-800">
              ✓ Emergency SOS Activated
            </div>
            <p className="text-sm text-green-700">Emergency request ready</p>
          </div>
        )}
      </div>
    </div>
  );
}
