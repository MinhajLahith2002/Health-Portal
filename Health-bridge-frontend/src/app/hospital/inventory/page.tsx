"use client";

import React from "react";
import Link from "next/link";
import { useHospital } from "@/context/HospitalContext";
import { LowStockAlert } from "@/components/hospital/inventory/LowStockAlert";
import { Plus, Package, Edit, Trash2, Eye } from "lucide-react";
import DashboardLayout from "@/app/dashboard/layout";

// ✅ Currency formatter for LKR
const formatLKR = (amount: number) => {
  return `Rs. ${amount.toLocaleString('en-LK', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

export default function InventoryPage() {
  const {
    inventory,
    lowStockItems,
    inventoryLoading,
    inventoryError,
    deleteInventoryItem,
  } = useHospital();

  if (inventoryLoading) {
    return (
      <DashboardLayout pageTitle="Inventory Management">
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (inventoryError) {
    return (
      <DashboardLayout pageTitle="Inventory Management">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p className="font-medium">❌ Error loading inventory</p>
          <p className="text-sm mt-1">{inventoryError}</p>
        </div>
      </DashboardLayout>
    );
  }

  const totalValue = inventory.reduce((sum, i) => sum + (i.unitCost * i.quantity), 0);

  return (
    <DashboardLayout pageTitle="Inventory Management">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hospital Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage medical supplies and equipment</p>
        </div>
        <Link
          href="/hospital/inventory/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Items</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{inventory.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Categories</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {new Set(inventory.map(i => i.category)).size}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Value</p>
          {/* ✅ LKR Currency */}
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {formatLKR(totalValue)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Low Stock</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{lowStockItems.length}</p>
        </div>
      </div>

      <LowStockAlert items={lowStockItems} />

      {inventory.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No inventory items</h3>
          <p className="text-sm text-slate-500 mt-1">Add your first inventory item to get started.</p>
          <Link
            href="/hospital/inventory/create"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit Cost</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Value</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{item.itemName}</div>
                      <div className="text-xs text-slate-500">{item.itemCode}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.category}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {item.quantity} {item.unit}
                    </td>
                    {/* ✅ LKR Unit Cost */}
                    <td className="px-4 py-3 text-slate-600">
                      {formatLKR(item.unitCost)}
                    </td>
                    {/* ✅ LKR Total Value */}
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {formatLKR(item.unitCost * item.quantity)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.location}</td>
                    <td className="px-4 py-3">
                      {item.lowStock ? (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/hospital/inventory/${item.id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/hospital/inventory/${item.id}/edit`}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => deleteInventoryItem(item.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}