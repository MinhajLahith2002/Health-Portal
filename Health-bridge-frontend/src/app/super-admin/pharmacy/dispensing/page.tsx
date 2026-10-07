"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import { 
  ChevronRight,
  Check,
  Minus,
  Plus
} from "lucide-react";

const initialMedications = [
  {
    id: 1,
    name: "Amoxicillin 500mg",
    batch: "Batch AX219",
    exp: "Exp 04 Feb 2027",
    qty: 21,
    checked: true,
  },
  {
    id: 2,
    name: "Paracetamol 500mg",
    batch: "Batch PC118",
    exp: "Exp 12 Jun 2028",
    qty: 10,
    checked: true,
  },
  {
    id: 3,
    name: "ORS Sachets",
    batch: "Batch ORS51",
    exp: "Exp 21 Jan 2028",
    qty: 5,
    checked: false,
  }
];

export default function PharmacyDispensingPage() {
  const [meds, setMeds] = useState(initialMedications);
  const [homeDelivery, setHomeDelivery] = useState(true);
  const [smsNotice, setSmsNotice] = useState(false);

  const toggleCheck = (id: number) => {
    setMeds(meds.map(m => m.id === id ? { ...m, checked: !m.checked } : m));
  };

  const updateQty = (id: number, delta: number) => {
    setMeds(meds.map(m => m.id === id ? { ...m, qty: Math.max(1, m.qty + delta) } : m));
  };

  return (
    <>
      {/* Custom Header Area */}
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Link href="/super-admin/pharmacy" className="hover:text-slate-600 transition-colors">Pharmacy</Link>
            <ChevronRight size={12} />
            <span className="text-[#0A2540] dark:text-slate-200">Dispensing</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A2540] dark:text-white">
            Dispense medication
          </h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto space-y-6">
        
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Column: Dispensing List (60%) */}
          <div className="flex-1 space-y-6">
            <Card className="p-6 md:p-8">
              
              {/* Card Header */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-[#0A2540] dark:text-white">
                  Dispensing — Kasun Perera
                </h3>
                <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold tracking-wider">
                  RX #48213
                </span>
              </div>

              {/* Medication List */}
              <div className="space-y-0 mb-8">
                {meds.map((med, idx, arr) => (
                  <div key={med.id} className={`flex items-center justify-between py-5 ${idx !== arr.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                    <div className="flex items-start gap-4">
                      
                      {/* Custom Checkbox */}
                      <button 
                        onClick={() => toggleCheck(med.id)}
                        className={`mt-1 w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                          med.checked 
                            ? "bg-[#0052CC] border-[#0052CC] text-white" 
                            : "bg-white border-2 border-slate-300 dark:bg-slate-800 dark:border-slate-600"
                        }`}
                      >
                        {med.checked && <Check size={14} strokeWidth={3} />}
                      </button>

                      {/* Info */}
                      <div>
                        <p className={`text-sm font-bold transition-colors ${med.checked ? "text-[#0A2540] dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                          {med.name}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                          {med.batch} - {med.exp}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Adjuster */}
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-2 py-1">
                      <button 
                        onClick={() => updateQty(med.id, -1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm transition-all"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-slate-700 dark:text-slate-200">
                        {med.qty}
                      </span>
                      <button 
                        onClick={() => updateQty(med.id, 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:bg-white hover:shadow-sm transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <Button variant="primary" className="bg-[#0052CC] hover:bg-blue-700 font-bold px-6">
                  Complete dispensing
                </Button>
                <Button variant="outline" className="font-bold text-slate-700 border-slate-200 hover:bg-slate-50 px-6">
                  Add counselling note
                </Button>
              </div>

            </Card>
          </div>

          {/* Right Column: Order Summary (40%) */}
          <div className="w-full lg:w-[40%] xl:w-[35%] space-y-6">
            <Card className="p-6 md:p-8">
              
              <h3 className="text-base font-bold text-[#0A2540] dark:text-white mb-6">
                Order summary
              </h3>

              {/* Line Items */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Amoxicillin 500mg × 21</span>
                  <span className="text-slate-900 dark:text-white font-semibold">Rs 1,260</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Paracetamol 500mg × 10</span>
                  <span className="text-slate-900 dark:text-white font-semibold">Rs 150</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">ORS Sachets × 5</span>
                  <span className="text-slate-900 dark:text-white font-semibold">Rs 400</span>
                </div>
                <div className="flex items-center justify-between text-[13px] pt-2">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Insurance coverage</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">- Rs 900</span>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 my-6"></div>

              {/* Total Due */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-bold text-[#0A2540] dark:text-white">Total due</span>
                <span className="text-lg font-bold text-[#0A2540] dark:text-white">Rs 910</span>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 my-6"></div>

              {/* Toggles */}
              <div className="space-y-6">
                
                {/* Toggle 1 */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#0A2540] dark:text-white mb-0.5">Home delivery</p>
                    <p className="text-[10px] text-slate-400">Dispatch via Ceylon Logistics today</p>
                  </div>
                  <button 
                    onClick={() => setHomeDelivery(!homeDelivery)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors ${
                      homeDelivery ? "bg-[#0052CC]" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      homeDelivery ? "translate-x-4" : "translate-x-0"
                    }`}></div>
                  </button>
                </div>

                {/* Toggle 2 */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#0A2540] dark:text-white mb-0.5">SMS pickup notice</p>
                    <p className="text-[10px] text-slate-400">Notify patient when ready</p>
                  </div>
                  <button 
                    onClick={() => setSmsNotice(!smsNotice)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors ${
                      smsNotice ? "bg-[#0052CC]" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      smsNotice ? "translate-x-4" : "translate-x-0"
                    }`}></div>
                  </button>
                </div>

              </div>

            </Card>
          </div>

        </div>

      </div>
    </>
  );
}
