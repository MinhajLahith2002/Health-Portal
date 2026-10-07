"use client";

import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/axios";

export interface PatientSummary {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role?: string;
}

export function usePatients() {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get<PatientSummary[]>("/users");
      setPatients(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load patients"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => void reload(), 0);
    return () => window.clearTimeout(task);
  }, [reload]);

  return {
    patients,
    loading,
    error,
    reload,
  };
}

export default usePatients;
