"use client";

import { useCallback } from "react";
import DoctorProfileForm from "@/features/doctor/components/DoctorProfileForm";
import LoadingState from "@/features/doctor/components/LoadingState";
import PageHeader from "@/features/doctor/components/PageHeader";
import { useDoctorData } from "@/features/doctor/hooks/useDoctorData";
import { getDoctorProfile, updateDoctorProfile } from "@/features/doctor/services/doctorService";
import type { DoctorProfileUpdate } from "@/features/doctor/types";

export default function DoctorProfilePage() {
  const loader = useCallback(() => getDoctorProfile(), []);
  const { data, setData, loading, error } = useDoctorData(loader);
  async function save(update: DoctorProfileUpdate) { setData(await updateDoctorProfile(update)); }
  return <><PageHeader eyebrow="Account" title="Doctor profile" description="Keep your personal and professional credentials accurate for patients and staff." />{loading ? <LoadingState /> : error || !data ? <p className="rounded-md bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : <DoctorProfileForm doctor={data} onSave={save} />}</>;
}
