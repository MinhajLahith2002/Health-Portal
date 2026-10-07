"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import DashboardLayout from "@/app/dashboard/layout";
import { InventoryForm } from "@/components/hospital/inventory/InventoryForm";
import { useHospital } from "@/context/HospitalContext";
import { HospitalInventoryRequest } from "@/types/hospital";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateInventoryPage() {
  const router = useRouter();
  const { createInventoryItem, inventoryLoading } = useHospital();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: HospitalInventoryRequest) => {
    setIsLoading(true);
    try {
      await createInventoryItem(data);
      router.push("/hospital/inventory");
    } catch (error) {
      console.error("Failed to create inventory item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Add Inventory Item">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/hospital/inventory" className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Inventory Item</h1>
          <p className="text-sm text-slate-500 mt-1">Add a new medical supply or equipment</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <InventoryForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/hospital/inventory")}
          isLoading={isLoading || inventoryLoading}
        />
      </div>
    </DashboardLayout>
  );
}