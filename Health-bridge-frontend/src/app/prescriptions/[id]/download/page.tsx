"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { prescriptionService } from "@/services/prescriptionService";
import { Prescription } from "@/types/prescription";
import { generatePrescriptionPdf } from "@/lib/prescriptionPdf";
import api from "@/lib/axios";
import { Download, ArrowLeft, FileText, Loader2 } from "lucide-react";

export default function DownloadPrescriptionPage() {
  const params = useParams();
  const id = params.id as string;
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [doctorBranch, setDoctorBranch] = useState<string>("Health Bridge Hospital");

  useEffect(() => {
    prescriptionService
      .getPrescriptionById(id)
      .then(async (prescriptionData) => {
        setData(prescriptionData);
        
        if (prescriptionData.doctorId) {
          try {
            // ✅ FIXED: api.get already returns the data directly (due to interceptor)
            const doctorProfile = await api.get<any>(`/users/profile/${prescriptionData.doctorId}`);
            
            // ✅ Access branch directly from the returned data object
            if (doctorProfile && doctorProfile.branch) {
              setDoctorBranch(doctorProfile.branch);
              console.log("✅ Doctor branch loaded successfully:", doctorProfile.branch);
            } else {
              console.log("⚠️ No branch found in doctor profile:", doctorProfile);
            }
          } catch (err) {
            console.error("❌ Failed to fetch doctor branch", err);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      await generatePrescriptionPdf(data, doctorBranch);
    } catch (error) {
      console.error(error);
      alert("Failed to generate prescription PDF.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) return <div className="text-center text-red-600">Prescription not found</div>;

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <FileText className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-slate-900">Download Prescription</h1>
        <p className="mt-2 text-sm text-slate-500">
          Prescription: <span className="font-semibold text-slate-700">{data.prescriptionNumber}</span>
        </p>
        <p className="mt-1 text-xs text-slate-500">Includes Issue Date, QR Code, Medicines, and Instructions</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? "Generating..." : "Download PDF"}
          </button>
          <Link
            href={`/prescriptions/${id}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-6 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" /> Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}