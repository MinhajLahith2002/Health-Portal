"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/dashboard/layout";
import { useHospital } from "@/context/HospitalContext";
import { InvoiceView } from "@/components/hospital/billing/InvoiceView";
import PageHeader from "@/components/ui/PageHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ArrowLeft, Printer, Edit, Trash2, AlertCircle } from "lucide-react";
import { printElement } from "@/lib/print";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InvoiceViewPage({ params }: PageProps) {
  const router = useRouter();
  const { invoices, invoicesLoading, deleteInvoice } = useHospital();
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    params.then((r) => {
      setId(r.id);
      setLoading(false);
    });
  }, [params]);

  const invoice = id ? invoices.find((i) => i.id === id) ?? null : null;
  const isLoading = loading || invoicesLoading;

  const handleDelete = async () => {
    if (!invoice) return;
    setDeleting(true);
    try {
      await deleteInvoice(invoice.id);
      router.push("/hospital/billing");
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Invoice Details">
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-500">Loading invoice...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout pageTitle="Invoice Details">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-700">Invoice Not Found</h3>
          <p className="text-sm text-red-600 mt-2">
            The invoice you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/hospital/billing"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Billing
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Invoice Details">
      <PageHeader
        title="Invoice Details"
        subtitle={invoice.invoiceNumber}
        backHref="/hospital/billing"
        actions={
          <>
            <button
              onClick={() => printElement("invoice-print")}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition"
            >
              <Printer className="w-4 h-4" /> Print PDF
            </button>
            <Link
              href={`/hospital/billing/invoices/${invoice.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition"
            >
              <Edit className="w-4 h-4" /> Edit
            </Link>
            <button
              onClick={() => setShowDelete(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </>
        }
      />

      <InvoiceView invoice={invoice} printId="invoice-print" />

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete Invoice?"
        message={`Are you sure you want to delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </DashboardLayout>
  );
}