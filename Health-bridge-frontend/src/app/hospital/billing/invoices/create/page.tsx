"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DashboardLayout from "@/app/dashboard/layout";
import { InvoiceForm } from "@/components/hospital/billing/InvoiceForm";
import { useHospital } from "@/context/HospitalContext";
import { InvoiceRequest } from "@/types/hospital";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateInvoicePage() {
  const router = useRouter();
  const { createInvoice, invoicesLoading } = useHospital();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: InvoiceRequest) => {
    setIsLoading(true);
    try {
      await createInvoice(data);
      router.push("/hospital/billing");
    } catch (error) {
      console.error("Failed to create invoice:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Create Invoice">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/hospital/billing" className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create New Invoice</h1>
          <p className="text-sm text-slate-500 mt-1">Fill in the details to generate a new invoice</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <InvoiceForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/hospital/billing")}
          isLoading={isLoading || invoicesLoading}
        />
      </div>
    </DashboardLayout>
  );
}