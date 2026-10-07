"use client";

import React from "react";
import { HospitalInventory } from "@/types/hospital";
import { AlertTriangle, Package } from "lucide-react";

// ✅ Currency formatter for LKR
const formatLKR = (amount: number) => {
  return `Rs. ${amount.toLocaleString('en-LK', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

interface LowStockAlertProps {
  items: HospitalInventory[];
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
          <Package className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-800">All items are well stocked!</p>
          <p className="text-xs text-emerald-600">No low stock alerts at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-red-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-red-800">
            ⚠️ Low Stock Alert ({items.length} items)
          </h3>
          <p className="text-xs text-red-600">These items need to be reordered soon.</p>
        </div>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-100 shadow-sm"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">{item.itemName}</p>
              <p className="text-xs text-slate-500">
                Code: {item.itemCode} • Location: {item.location}
              </p>
              {/* ✅ LKR Unit Cost */}
              <p className="text-xs text-slate-500 mt-0.5">
                Unit Cost: {formatLKR(item.unitCost)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-red-600">
                {item.quantity} {item.unit} remaining
              </p>
              <p className="text-xs text-slate-500">
                Reorder Level: {item.reorderLevel} {item.unit}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};