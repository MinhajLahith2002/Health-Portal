"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import PrescriptionForm from "@/components/prescription/PrescriptionForm";
import { prescriptionService } from "@/services/prescriptionService";
import { ArrowLeft } from "lucide-react";

export default function CreatePrescriptionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await prescriptionService.createPrescription({
        patientId: data.patientId,
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        notes: data.notes,
        items: data.items,
        validDays: data.validDays || 30,
        diagnosis: data.diagnosis || "General Checkup",
        doctorId: user.id,
        doctorName: user.fullName || "Unknown Doctor",
      });
      router.push("/prescriptions");
    } catch (error) {
      alert("Failed to create prescription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/prescriptions" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600"><ArrowLeft className="w-4 h-4" /> Back to Prescriptions</Link>
      <div><h1 className="text-2xl font-bold text-slate-900">Create E-Prescription</h1><p className="text-sm text-slate-500">Generate a new electronic prescription</p></div>
      <PrescriptionForm mode="create" onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}