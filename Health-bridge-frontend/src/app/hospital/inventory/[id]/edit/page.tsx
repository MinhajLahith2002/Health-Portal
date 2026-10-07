"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/app/dashboard/layout";
import { InventoryForm } from "@/components/hospital/inventory/InventoryForm";
import { useHospital } from "@/context/HospitalContext";
import { HospitalInventoryRequest } from "@/types/hospital";
import PageHeader from "@/components/ui/PageHeader";
import { AlertCircle } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditInventoryPage({ params }: PageProps) {
  const router = useRouter();
  const { inventory, inventoryLoading, updateInventoryItem } = useHospital();
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    params.then((r) => {
      setId(r.id);
      setLoading(false);
    });
  }, [params]);

  const item = id ? inventory.find((i) => i.id === id) ?? null : null;
  const isLoading = loading || inventoryLoading;

  const handleSubmit = async (data: HospitalInventoryRequest) => {
    if (!item) return;
    setIsSubmitting(true);
    try {
      await updateInventoryItem(item.id, data);
      router.push(`/hospital/inventory/${item.id}`);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Edit Item">
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout pageTitle="Edit Item">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-700">Item Not Found</h3>
          <Link
            href="/hospital/inventory"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
          >
            Back to Inventory
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Edit Item">
      <PageHeader
        title="Edit Inventory Item"
        subtitle={`${item.itemCode} • ${item.itemName}`}
        backHref={`/hospital/inventory/${item.id}`}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <InventoryForm
          initialData={{
            hospitalId: item.hospitalId,
            itemCode: item.itemCode,
            itemName: item.itemName,
            category: item.category,
            quantity: item.quantity,
            reorderLevel: item.reorderLevel,
            unit: item.unit,
            supplier: item.supplier,
            expiryDate: item.expiryDate,
            unitCost: item.unitCost,
            location: item.location,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/hospital/inventory/${item.id}`)}
          isLoading={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
}