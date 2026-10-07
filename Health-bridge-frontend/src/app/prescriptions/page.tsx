"use client";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { prescriptionService } from "@/services/prescriptionService";
import { Prescription } from "@/types/prescription";
import { useAuth } from "@/hooks/useAuth";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  FileText,
  Download,
  Eye,
  Pencil,
  Trash2,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";

const ITEMS_PER_PAGE = 5;

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchPrescriptions();
    }
  }, [user]);

  const fetchPrescriptions = async () => {
    if (!user?.id) {
      return;
    }

    try {
      setLoading(true);
      let data: Prescription[] = [];

      if (user?.role === "DOCTOR") {
        data = await prescriptionService.getPrescriptionsByDoctorId(user.id);
      } else if (user?.role === "PATIENT") {
        data = await prescriptionService.getPatientPrescriptions(user.id);
      } else {
        data = await prescriptionService.getAllPrescriptions();
      }

      setPrescriptions(data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    try {
      await prescriptionService.deletePrescription(confirmDeleteId);
      setPrescriptions((prev) => prev.filter((p) => p.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch (error) {
      alert("Failed to delete prescription.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return prescriptions;
    return prescriptions.filter(
      (p) =>
        p.patientName?.toLowerCase().includes(term) ||
        p.prescriptionNumber?.toLowerCase().includes(term) ||
        p.doctorName?.toLowerCase().includes(term)
    );
  }, [prescriptions, search]);

  const indexOfLast = currentPage * ITEMS_PER_PAGE;
  const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const prescriptionBeingDeleted = prescriptions.find((p) => p.id === confirmDeleteId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prescriptions</h1>
          <p className="text-sm text-slate-500">Manage and view electronic prescriptions</p>
        </div>
        {user?.role === "DOCTOR" && (
          <Link
            href="/prescriptions/create"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Create Prescription
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient, doctor, or Rx number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-xs font-medium text-slate-500">
          Showing <span className="font-bold text-slate-700">{filtered.length}</span> of{" "}
          <span className="font-bold text-slate-700">{prescriptions.length}</span> prescriptions
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No prescriptions found</h3>
            <p className="mt-1 text-xs text-slate-500">
              {search
                ? "No prescriptions match your search."
                : user?.role === "PATIENT"
                ? "You don't have any prescriptions yet."
                : "No prescriptions in the system."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">Rx Number</th>
                  <th className="px-6 py-4 font-semibold">Patient</th>
                  <th className="px-6 py-4 font-semibold">Doctor</th>
                  <th className="px-6 py-4 font-semibold">Date Issued</th>
                  <th className="px-6 py-4 font-semibold">Valid Until</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((p) => (
                  <tr key={p.id} className="transition hover:bg-slate-50/80">
                    <td className="px-6 py-4 font-medium text-slate-900">{p.prescriptionNumber}</td>
                    <td className="px-6 py-4 text-slate-600">{p.patientName}</td>
                    <td className="px-6 py-4 text-slate-600">{p.doctorName || "-"}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {p.validUntil ? new Date(p.validUntil).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/prescriptions/${p.id}`}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/prescriptions/${p.id}/download`}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-600"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Link>
                        {user?.role === "DOCTOR" && (
                          <>
                            <Link
                              href={`/prescriptions/${p.id}/edit`}
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-amber-50 hover:text-amber-600"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => setConfirmDeleteId(p.id)}
                              disabled={deletingId === p.id}
                              className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 cursor-pointer"
                              title="Delete"
                            >
                              {deletingId === p.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <p className="text-xs text-slate-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold transition hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold transition hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Delete this prescription?"
        message={
          prescriptionBeingDeleted
            ? `This will permanently remove ${prescriptionBeingDeleted.prescriptionNumber} for ${prescriptionBeingDeleted.patientName}. This action cannot be undone.`
            : "This action cannot be undone."
        }
        isLoading={!!deletingId}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}