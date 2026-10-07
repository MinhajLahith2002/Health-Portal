"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

import { 
  CheckSquare, 
  Hexagon, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Shield,
  DollarSign,
  Truck,
  LineChart,
  ChevronRight
} from "lucide-react";

const reportsData = [
  {
    title: "Prescription Fulfillment Report",
    desc: "Verified, dispensed, and pending prescriptions across the selected period.",
    icon: CheckSquare,
    color: "blue"
  },
  {
    title: "Drug Inventory Report",
    desc: "Full stock listing with batch numbers, quantities and locations.",
    icon: Hexagon,
    color: "blue"
  },
  {
    title: "Medicine Expiry Report",
    desc: "Medicines nearing expiry, grouped by risk window.",
    icon: Clock,
    color: "red"
  },
  {
    title: "Low Stock Alert Report",
    desc: "Items below reorder point with suggested order quantities.",
    icon: AlertTriangle,
    color: "blue"
  },
  {
    title: "Medication Dispensing Report",
    desc: "Dispensing activity by pharmacist, department and time of day.",
    icon: CheckCircle2,
    color: "blue"
  },
  {
    title: "Controlled Drug Report",
    desc: "Regulatory register for controlled substances, audit-ready.",
    icon: Shield,
    color: "red"
  },
  {
    title: "Pharmacy Sales Report",
    desc: "Revenue by medicine category, payment method and channel.",
    icon: DollarSign,
    color: "green"
  },
  {
    title: "Supplier Performance Report",
    desc: "On-time delivery rates and order accuracy by supplier.",
    icon: Truck,
    color: "blue"
  },
  {
    title: "Drug Usage Analysis Report",
    desc: "Consumption trends and demand forecasting by drug class.",
    icon: LineChart,
    color: "blue"
  },
];

export default function PharmacyReportsPage() {

  const getColorClasses = (color: string) => {
    switch(color) {
      case "red": return "bg-red-50 text-red-500 border-red-100";
      case "green": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "blue": 
      default: return "bg-blue-50 text-blue-600 border-blue-100";
    }
  };

  return (
    <>
      {/* Custom Header Area spanning full width below navbar to match Figma's split header */}
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Link href="/super-admin/pharmacy" className="hover:text-slate-600 transition-colors">Pharmacy</Link>
            <ChevronRight size={12} />
            <span className="text-[#0A2540] dark:text-slate-200">Report</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A2540] dark:text-white">
            Report
          </h1>
        </div>

      <div className="mx-auto space-y-6">
        
        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {reportsData.map((report, idx) => {
            const Icon = report.icon;
            const colorClasses = getColorClasses(report.color);

            return (
              <Card key={idx} className="p-6 flex flex-col hover:shadow-md transition-shadow h-full border border-slate-200/60 dark:border-slate-800">
                <div className="flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${colorClasses}`}>
                    <Icon size={20} />
                  </div>
                  
                  <h3 className="text-[15px] font-bold text-[#0A2540] dark:text-white mb-2">
                    {report.title}
                  </h3>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {report.desc}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 mt-8">
                  <button className="px-4 py-1.5 rounded-md text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    PDF
                  </button>
                  <button className="px-4 py-1.5 rounded-md text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    Excel
                  </button>
                </div>
              </Card>
            );
          })}

        </div>

      </div>
      </div>
    </>
  );
}
