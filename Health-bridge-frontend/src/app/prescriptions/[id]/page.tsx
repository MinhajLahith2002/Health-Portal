"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { prescriptionService } from "@/services/prescriptionService";
import QRCodeDisplay from "@/components/prescription/QRCodeDisplay";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Prescription } from "@/types/prescription";
import { buildQrPayload, generatePrescriptionPdf } from "@/lib/prescriptionPdf";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/axios";
import { Download, ArrowLeft, Calendar, Pencil, Trash2, Loader2 } from "lucide-react";

function StatusBadge({ status }: { status?: string }) {
  const normalized = (status || "ACTIVE").toUpperCase();
  const styles: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    COMPLETED: "bg-blue-50 text-blue-700 ring-blue-100",
    CANCELLED: "bg-rose-50 text-rose-700 ring-rose-100",
  };
  const style = styles[normalized] || "bg-slate-100 text-slate-600 ring-slate-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${style}`}>
      {normalized}
    </span>
  );
}

export default function PrescriptionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;
  const [data, setData] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [doctorBranch, setDoctorBranch] = useState<string>("Health Bridge Hospital");

  useEffect(() => {
    prescriptionService.getPrescriptionById(id).then(async (prescriptionData) => {
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
          console.error(" Failed to fetch doctor branch", err);
        }
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await prescriptionService.deletePrescription(id);
      router.push("/prescriptions");
    } catch (error) {
      alert("Failed to delete prescription.");
      setDeleting(false);
    }
  };

  const handleDownload = async () => {
    if (!data) return;
    await generatePrescriptionPdf(data, doctorBranch);
  };

  if (loading) return <div className="flex min-h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>;
  if (!data) return <div className="text-center text-red-600">Prescription not found</div>;

  const qrValue = buildQrPayload(data);
  const isDoctor = user?.role === "DOCTOR";

  return (
    <div className="space-y-6">
      <Link href="/prescriptions" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600"><ArrowLeft className="w-4 h-4" /> Back to Prescriptions</Link>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">{data.prescriptionNumber}</span>
              <StatusBadge status={data.status} />
            </div>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Prescription Details</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(data.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>Valid until: {new Date(data.validUntil).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
            {isDoctor && (
              <>
                <Link href={`/prescriptions/${id}/edit`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200">
                  <Pencil className="w-4 h-4" /> Edit
                </Link>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                >
                  <Trash2 className="w-4 w-4" /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-slate-900">Prescribed Medicines ({data.items.length})</h2>
            <div className="divide-y divide-slate-100">
              {data.items.map((item, index) => (
                <div key={index} className="flex flex-col gap-4 py-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{index + 1}</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.medicineName}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.dosage} • {item.frequency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700 ring-1 ring-blue-100">Qty: {item.quantity}</span>
                    <p className="mt-2 text-[10px] font-semibold uppercase text-slate-400">{item.duration}</p>
                    <p className="text-xs font-medium text-slate-600">{item.instructions}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {data.diagnosis && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900">Diagnosis</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{data.diagnosis}</p>
            </div>
          )}
          {data.notes && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-6">
              <h2 className="text-sm font-bold text-blue-900">Doctor's Notes</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{data.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Verification QR Code</h2>
            <p className="mt-1 text-[11px] text-slate-500">Scan at pharmacy to validate</p>
            <div className="mt-4 flex justify-center rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <QRCodeDisplay value={qrValue} size={140} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Patient Information</h2>
            <div className="mt-4 space-y-4">
              <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Name</p><p className="mt-1 text-sm font-semibold text-slate-900">{data.patientName}</p></div>
              <div className="border-t border-slate-100 pt-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Phone</p><p className="mt-1 text-sm font-semibold text-slate-900">{data.patientPhone}</p></div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Prescribed By</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{data.doctorName}</p>
                {doctorBranch && <p className="text-xs text-slate-500">{doctorBranch}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete this prescription?"
        message={`This will permanently remove ${data.prescriptionNumber} for ${data.patientName}. This action cannot be undone.`}
        isLoading={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}