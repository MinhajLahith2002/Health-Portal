"use client";

import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/axios";

export interface DoctorSummary {
  id: string;
  fullName: string;
  email: string;
  specialization?: string;
  phoneNumber?: string;
}

export function useDoctors() {
  const [doctors, setDoctors] = useState<DoctorSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get<DoctorSummary[]>("/doctors");
      setDoctors(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load doctors"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => void reload(), 0);
    return () => window.clearTimeout(task);
  }, [reload]);

  return {
    doctors,
    loading,
    error,
    reload,
  };
}

export default useDoctors;
