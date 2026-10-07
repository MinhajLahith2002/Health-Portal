"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";

import { Plus } from "lucide-react";

// Mock Data
const inventoryData = [
  {
    id: 1,
    name: "Amoxicillin 500mg",
    category: "Antibiotic · Cap",
    batch: "AX219",
    stockLevel: 12,
    maxStock: 100,
    status: "critical",
    expiry: "04 Feb 2027",
    reorderPoint: "50 units",
  },
  {
    id: 2,
    name: "Metformin 850mg",
    category: "Antidiabetic · Tab",
    batch: "MF087",
    stockLevel: 34,
    maxStock: 100,
    status: "low",
    expiry: "18 Nov 2026",
    reorderPoint: "80 units",
  },
  {
    id: 3,
    name: "Salbutamol Inhaler",
    category: "Respiratory",
    batch: "SB402",
    stockLevel: 48,
    maxStock: 100,
    status: "medium",
    expiry: "24 Aug 2026",
    reorderPoint: "60 units",
  },
  {
    id: 4,
    name: "Paracetamol 500mg",
    category: "Analgesic · Tab",
    batch: "PC118",
    stockLevel: 100, // Representing full bar visually
    actualStock: "620",
    maxStock: 100,
    status: "healthy",
    expiry: "12 Jun 2028",
    reorderPoint: "200 units",
  },
  {
    id: 5,
    name: "Morphine Sulfate 10mg",
    category: "Controlled · Inj",
    batch: "MS033",
    stockLevel: 75,
    actualStock: "26",
    maxStock: 100,
    status: "healthy",
    expiry: "30 Mar 2027",
    reorderPoint: "15 units",
  },
];

export default function PharmacyInventoryPage() {
  const [activeTab, setActiveTab] = useState("All medicines");

  const tabs = ["All medicines", "Low stock", "Expiring soon", "Controlled drugs"];

  const renderStockBar = (item: any) => {
    let colorClass = "";
    let bgColorClass = "bg-slate-200 dark:bg-slate-700";
    let isHealthy = item.status === "healthy";
    
    if (item.status === "critical") colorClass = "bg-red-500";
    else if (item.status === "low" || item.status === "medium") colorClass = "bg-[#0052CC]";
    else if (item.status === "healthy") colorClass = "bg-emerald-600";

    const displayUnits = item.actualStock || item.stockLevel;

    return (
      <div className="flex items-center gap-4 w-40">
        <div className="relative w-20 h-1.5 flex items-center">
          {/* Background Track */}
          <div className={`absolute inset-0 rounded-full ${isHealthy ? 'bg-emerald-100 dark:bg-emerald-900/30' : bgColorClass}`}></div>
          
          {/* Fill */}
          <div 
            className={`absolute left-0 top-0 bottom-0 rounded-full ${colorClass}`}
            style={{ width: `${item.stockLevel}%` }}
          >
            {/* Dot (only for non-healthy) */}
            {!isHealthy && (
              <div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${colorClass}`}></div>
            )}
          </div>
        </div>
        <span className="text-sm font-bold text-[#0A2540] dark:text-white shrink-0">
          {displayUnits} units
        </span>
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        
        {/* Header Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none px-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-colors ${
                  activeTab === tab
                    ? "bg-[#0A2540] text-white" 
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Add Button */}
          <div className="px-2">
            <Button variant="primary" leftIcon={<Plus size={16} />} className="font-bold bg-[#0052CC] hover:bg-blue-700 rounded-lg">
              Add medicine
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden p-2">
          <Table className="border-0 shadow-none">
            <TableHeader className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4 pl-6">MEDICINE</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">BATCH</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">STOCK LEVEL</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">EXPIRY</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">REORDER POINT</TableHead>
                <TableHead className="py-4 pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryData.map((item, index) => (
                <TableRow key={index} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <TableCell className="pl-6 py-5">
                    <div>
                      <p className="text-sm font-bold text-[#0A2540] dark:text-white mb-0.5">
                        {item.name}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400 tracking-wide">
                        {item.category}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {item.batch}
                    </span>
                  </TableCell>
                  <TableCell className="py-5">
                    {renderStockBar(item)}
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {item.expiry}
                    </span>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {item.reorderPoint}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 pr-6 text-right">
                    <Button variant="outline" className="text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50 px-4 h-8 rounded-lg">
                      Reorder
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      </div>
    </>
  );
}
