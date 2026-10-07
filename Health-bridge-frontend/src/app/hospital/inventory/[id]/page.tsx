"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/dashboard/layout";
import { useHospital } from "@/context/HospitalContext";
import PageHeader from "@/components/ui/PageHeader";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { formatLKR } from "@/lib/currency";
import {
  Printer, Edit, Trash2, AlertCircle, Package, MapPin, Calendar,
  Truck, DollarSign, Tag, Building2, Hash,
} from "lucide-react";
import { printElement } from "@/lib/print";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InventoryViewPage({ params }: PageProps) {
  const router = useRouter();
  const { inventory, inventoryLoading, deleteInventoryItem } = useHospital();
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

  const item = id ? inventory.find((i) => i.id === id) ?? null : null;
  const isLoading = loading || inventoryLoading;

  const handleDelete = async () => {
    if (!item) return;
    setDeleting(true);
    try {
      await deleteInventoryItem(item.id);
      router.push("/hospital/inventory");
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Item Details">
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout pageTitle="Item Details">
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

  const totalValue = item.unitCost * item.quantity;

  return (
    <DashboardLayout pageTitle="Item Details">
      <PageHeader
        title="Inventory Item Details"
        subtitle={`${item.itemCode} • ${item.itemName}`}
        backHref="/hospital/inventory"
        actions={
          <>
            <button
              onClick={() => printElement("inventory-print")}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <Link
              href={`/hospital/inventory/${item.id}/edit`}
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

      <div id="inventory-print" className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Package className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{item.itemName}</h2>
                <p className="text-emerald-100 text-sm">Code: {item.itemCode}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-100 uppercase tracking-wider">Total Value</p>
              <p className="text-3xl font-bold mt-1">{formatLKR(totalValue)}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex flex-wrap gap-2">
            {item.lowStock ? (
              <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                ⚠️ Low Stock
              </span>
            ) : (
              <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                ✅ In Stock
              </span>
            )}
            <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
              {item.category}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard icon={<Hash className="w-5 h-5 text-blue-500" />} label="Quantity" value={`${item.quantity} ${item.unit}`} />
            <InfoCard icon={<Package className="w-5 h-5 text-purple-500" />} label="Reorder Level" value={`${item.reorderLevel} ${item.unit}`} />
            <InfoCard icon={<DollarSign className="w-5 h-5 text-emerald-500" />} label="Unit Cost" value={formatLKR(item.unitCost)} />
            <InfoCard icon={<Building2 className="w-5 h-5 text-cyan-500" />} label="Hospital ID" value={item.hospitalId} />
            <InfoCard icon={<MapPin className="w-5 h-5 text-rose-500" />} label="Location" value={item.location || "N/A"} />
            <InfoCard icon={<Truck className="w-5 h-5 text-amber-500" />} label="Supplier" value={item.supplier || "N/A"} />
            <InfoCard icon={<Calendar className="w-5 h-5 text-indigo-500" />} label="Expiry Date" value={item.expiryDate ? new Date(item.expiryDate).toLocaleDateString("en-LK") : "N/A"} />
            <InfoCard icon={<Tag className="w-5 h-5 text-teal-500" />} label="Category" value={item.category} />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete Inventory Item?"
        message={`Are you sure you want to delete ${item.itemName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </DashboardLayout>
  );
}

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon, label, value,
}) => (
  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
    </div>
    <p className="text-sm font-semibold text-slate-900">{value}</p>
  </div>
);