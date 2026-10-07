"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, X, Loader2, Building2 } from "lucide-react";
import { hospitalService, HospitalSummary } from "@/services/hospital.service";

interface HospitalSelectProps {
  value: string;
  onChange: (hospitalId: string, hospitalName: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const HospitalSelect: React.FC<HospitalSelectProps> = ({
  value,
  onChange,
  placeholder = "Search hospital...",
  required = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hospitals, setHospitals] = useState<HospitalSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Derive filtered list without state
  const filtered = useMemo(() => {
    if (!query.trim()) {
      return hospitals.slice(0, 10);
    }
    const lower = query.toLowerCase();
    return hospitals
      .filter((h) => h.name?.toLowerCase().includes(lower))
      .slice(0, 10);
  }, [query, hospitals]);

  // ✅ Derive selected hospital without state
  const selected = useMemo(() => {
    if (!value || hospitals.length === 0) return null;
    return hospitals.find((h) => h.id === value) ?? null;
  }, [value, hospitals]);

  // ✅ Load hospitals (uses setTimeout to defer setState)
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      if (cancelled) return;

      setLoading(true);
      try {
        const data = await hospitalService.getAllHospitals();
        if (!cancelled) {
          setHospitals(data);
        }
      } catch (err) {
        console.error("Failed to load hospitals:", err);
        if (!cancelled) {
          setHospitals([]);
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

  // ✅ Event handlers (no setState in effect)
  const handleSelect = useCallback(
    (hospital: HospitalSummary) => {
      onChange(hospital.id, hospital.name);
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
        Hospital {required && <span className="text-red-500">*</span>}
      </label>

      {selected ? (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{selected.name}</p>
              <p className="text-xs text-slate-500">{selected.id}</p>
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
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white text-left text-sm text-slate-500 disabled:opacity-50 transition"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span>{placeholder}</span>
        </button>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-xl bg-white border border-slate-200 shadow-2xl max-h-72 overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hospital..."
              autoFocus
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-transparent focus:border-emerald-500 focus:bg-white text-sm outline-none transition"
            />
          </div>

          <div className="max-h-56 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-emerald-600" />
                <p className="text-xs text-slate-500 mt-2">Loading hospitals...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-center">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">
                  {hospitals.length === 0
                    ? "No hospitals available"
                    : "No hospitals found"}
                </p>
                {hospitals.length === 0 && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Check your backend connection
                  </p>
                )}
              </div>
            ) : (
              filtered.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => handleSelect(h)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-emerald-50 transition text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {h.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{h.id}</p>
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

export default HospitalSelect;