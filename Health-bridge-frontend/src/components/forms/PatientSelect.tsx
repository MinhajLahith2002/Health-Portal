"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, X, Loader2, User } from "lucide-react";
import { patientService, PatientSummary } from "@/services/patientService";

interface PatientSelectProps {
  value: string;
  onChange: (patientId: string, patientName: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const PatientSelect: React.FC<PatientSelectProps> = ({
  value,
  onChange,
  placeholder = "Search patient by ID or name...",
  required = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Derive filtered list (no setState in effect)
  const filteredPatients = useMemo(() => {
    if (!query.trim()) {
      return patients.slice(0, 10);
    }
    const lower = query.toLowerCase();
    return patients
      .filter(
        (p) =>
          p.id?.toLowerCase().includes(lower) ||
          p.fullName?.toLowerCase().includes(lower) ||
          p.email?.toLowerCase().includes(lower)
      )
      .slice(0, 10);
  }, [query, patients]);

  // ✅ Derive selected patient (no setState in effect)
  const selectedPatient = useMemo(() => {
    if (!value || patients.length === 0) return null;
    return patients.find((p) => p.id === value) ?? null;
  }, [value, patients]);

  // ✅ Load patients (with setTimeout to defer setState)
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      if (cancelled) return;

      setLoading(true);
      try {
        const data = await patientService.getAllPatients();
        if (!cancelled) {
          setPatients(data);
        }
      } catch (err) {
        console.error("Failed to load patients:", err);
        if (!cancelled) {
          setPatients([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // ✅ Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ✅ Event handlers (memoized)
  const handleSelect = useCallback(
    (patient: PatientSummary) => {
      onChange(patient.id, patient.fullName);
      setIsOpen(false);
      setQuery("");
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange("", "");
    setQuery("");
  }, [onChange]);

  const handleToggleOpen = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  }, [disabled]);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Patient {required && <span className="text-red-500">*</span>}
      </label>

      {selectedPatient ? (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-blue-300 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              {selectedPatient.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {selectedPatient.fullName}
              </p>
              <p className="text-xs text-slate-500">
                {selectedPatient.id} • {selectedPatient.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleToggleOpen}
          disabled={disabled}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-blue-300 bg-white text-left text-sm text-slate-500 disabled:opacity-50 transition"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span>{placeholder}</span>
        </button>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-xl bg-white border border-slate-200 shadow-2xl max-h-72 overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                autoFocus
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-transparent focus:border-blue-500 focus:bg-white text-sm outline-none transition"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600" />
                <p className="text-xs text-slate-500 mt-2">Loading patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-4 text-center">
                <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">
                  {patients.length === 0
                    ? "No patients available"
                    : "No patients found"}
                </p>
                {patients.length === 0 && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Check your backend connection
                  </p>
                )}
              </div>
            ) : (
              filteredPatients.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(p)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 transition text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {p.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {p.fullName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {p.id} • {p.email}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSelect;