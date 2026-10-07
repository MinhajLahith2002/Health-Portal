"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/dashboard/layout";
import { InvoiceForm } from "@/components/hospital/billing/InvoiceForm";
import { useHospital } from "@/context/HospitalContext";
import { InvoiceRequest } from "@/types/hospital";
import PageHeader from "@/components/ui/PageHeader";
import { AlertCircle } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditInvoicePage({ params }: PageProps) {
  const router = useRouter();
  const { invoices, invoicesLoading, updateInvoice } = useHospital();
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    params.then((r) => {
      setId(r.id);
      setLoading(false);
    });
  }, [params]);

  const invoice = id ? invoices.find((i) => i.id === id) ?? null : null;
  const isLoading = loading || invoicesLoading;

  const handleSubmit = async (data: InvoiceRequest) => {
    if (!invoice) return;
    setIsSubmitting(true);
    try {
      await updateInvoice(invoice.id, data);
      router.push(`/hospital/billing/invoices/${invoice.id}`);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Edit Invoice">
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout pageTitle="Edit Invoice">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-700">Invoice Not Found</h3>
          <Link
            href="/hospital/billing"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
          >
            Back to Billing
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Edit Invoice">
      <PageHeader
        title="Edit Invoice"
        subtitle={`Updating ${invoice.invoiceNumber}`}
        backHref={`/hospital/billing/invoices/${invoice.id}`}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <InvoiceForm
          initialData={{
            patientId: invoice.patientId,
            patientName: invoice.patientName,
            hospitalId: invoice.hospitalId,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            subtotal: invoice.subtotal,
            discount: invoice.discount,
            tax: invoice.tax,
            paidAmount: invoice.paidAmount,
            notes: invoice.notes,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/hospital/billing/invoices/${invoice.id}`)}
          isLoading={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
}