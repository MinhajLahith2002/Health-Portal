"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Loader2 } from "lucide-react";
import { branchService, type Branch } from "@/services/branchService";

interface AppointmentBranchSelectProps {
  value: string;
  onChange: (branchId: string, branchName: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

/** Branch selector used only by appointment-management screens. */
export default function AppointmentBranchSelect({
  value,
  onChange,
  placeholder = "Select hospital branch",
  required = false,
  disabled = false,
}: AppointmentBranchSelectProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    branchService.getAllBranches()
      .then((items) => {
        if (!active) return;
        setBranches(items.filter((branch) => branch.status === "ACTIVE"));
        setError("");
      })
      .catch(() => {
        if (active) setError("Unable to load hospital branches.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const selected = useMemo(
    () => branches.find((branch) => (branch.hospitalId || branch.id) === value),
    [branches, value],
  );

  return (
    <label className="space-y-2">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Building2 className="h-4 w-4 text-blue-600" />
        Hospital branch {required && <span className="text-red-500">*</span>}
      </span>
      <div className="relative">
        <select
          required={required}
          disabled={disabled || loading}
          value={value}
          onChange={(event) => {
            const branch = branches.find((item) => (item.hospitalId || item.id) === event.target.value);
            onChange(event.target.value, branch?.branchName ?? "");
          }}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
        >
          <option value="">{loading ? "Loading branches..." : placeholder}</option>
          {branches.map((branch) => {
            const id = branch.hospitalId || branch.id;
            return <option key={branch.id} value={id}>{branch.branchName}</option>;
          })}
        </select>
        {loading && <Loader2 className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 animate-spin text-blue-600" />}
      </div>
      {error && <span className="block text-xs text-rose-600">{error}</span>}
      {selected && <span className="block text-xs text-slate-500">{selected.city || selected.address || selected.hospitalId}</span>}
      {!loading && !error && branches.length === 0 && <span className="block text-xs text-amber-700">No active branches are available.</span>}
    </label>
  );
}
