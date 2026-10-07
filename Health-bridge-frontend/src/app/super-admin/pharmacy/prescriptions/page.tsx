"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import { 
  ChevronRight,
  QrCode,
  Menu,
  Check,
  AlertTriangle
} from "lucide-react";

export default function PharmacyPrescriptionsPage() {
  return (
    <>
      {/* Custom Header Area */}
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Link href="/super-admin/pharmacy" className="hover:text-slate-600 transition-colors">Pharmacy</Link>
            <ChevronRight size={12} />
            <span className="text-[#0A2540] dark:text-slate-200">Prescriptions</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A2540] dark:text-white">
            Verify & process prescriptions
          </h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto space-y-6">
        
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
          
          {/* Left Column: QR Scanner (45%) */}
          <div className="w-full lg:w-[45%] shrink-0">
            <Card className="p-8 bg-[#0A1A2F] dark:bg-[#071324] border-0 rounded-3xl overflow-hidden relative flex flex-col h-[500px]">
              
              <div className="flex justify-between items-start mb-8 text-white z-10">
                <button className="text-white hover:text-blue-300 transition-colors">
                  <Menu size={24} />
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center z-10">
                <h3 className="text-lg font-bold text-white mb-8">Scan QR prescription</h3>

                {/* Viewport Frame */}
                <div className="relative w-48 h-48 mb-8">
                  {/* Corner Brackets */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                  
                  {/* Internal dotted border connecting corners */}
                  <div className="absolute inset-2 border-2 border-dashed border-blue-500/30 rounded-lg"></div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <QrCode size={64} className="text-blue-300/80" strokeWidth={1} />
                  </div>
                </div>

                <p className="text-xs text-center text-blue-200/70 font-medium px-4 mb-8 leading-relaxed max-w-xs">
                  Point the pharmacy scanner at the prescription QR code, or enter the prescription ID manually.
                </p>

                <Button variant="primary" className="w-full font-bold bg-[#1D4ED8] hover:bg-blue-600 text-white rounded-xl py-3 border-0">
                  Enter ID manually
                </Button>
              </div>
              
              {/* Subtle background glow effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            </Card>
          </div>

          {/* Right Column: Details (55%) */}
          <div className="flex-1 min-w-0">
            <Card className="p-6 md:p-8 rounded-3xl h-[500px] flex flex-col">
              
              {/* Header Info */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-[#0A2540] dark:text-white mb-1">Kasun Perera</h2>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Prescribed by Dr. S. Fernando · General Medicine · 09 Aug 2026
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                  <Check size={12} strokeWidth={3} />
                  <span className="text-[11px] font-bold tracking-wide">Verified</span>
                </div>
              </div>

              {/* Alert Banner */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl mb-6">
                <AlertTriangle size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-[13px] font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
                  Mild interaction flagged between Amoxicillin and patient's existing Warfarin course. Counsel patient before dispensing.
                </p>
              </div>

              {/* Medication List (Scrollable) */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-0 scrollbar-thin">
                
                {/* Item 1 */}
                <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-[13px] font-bold text-[#0A2540] dark:text-white mb-1">Amoxicillin 500mg</h4>
                    <p className="text-[11px] font-medium text-slate-400">1 CAP · TID · 7 days</p>
                  </div>
                  <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full">
                    21 caps
                  </span>
                </div>

                {/* Item 2 */}
                <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-[13px] font-bold text-[#0A2540] dark:text-white mb-1">Paracetamol 500mg</h4>
                    <p className="text-[11px] font-medium text-slate-400">2 TAB · PRN · fever</p>
                  </div>
                  <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full">
                    10 tabs
                  </span>
                </div>

                {/* Item 3 */}
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h4 className="text-[13px] font-bold text-[#0A2540] dark:text-white mb-1">ORS Sachets</h4>
                    <p className="text-[11px] font-medium text-slate-400">1 sachet · as needed</p>
                  </div>
                  <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full">
                    5 sachets
                  </span>
                </div>

              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 mt-2 pt-6 shrink-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary" className="bg-[#0A2540] hover:bg-[#113255] font-bold px-5 py-2">
                    Approve & send to dispensing
                  </Button>
                  <Button variant="outline" className="font-bold text-slate-700 border-slate-200 hover:bg-slate-50 px-5 py-2">
                    Suggest substitute
                  </Button>
                  <Button variant="outline" className="font-bold text-red-600 bg-red-50 border-transparent hover:bg-red-100 px-5 py-2 ml-auto">
                    Reject
                  </Button>
                </div>
              </div>

            </Card>
          </div>

        </div>

      </div>
    </>
  );
}
