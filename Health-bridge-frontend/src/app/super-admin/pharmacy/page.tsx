"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  Hexagon, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  ArrowUp, 
  Pill,
  ChevronDown
} from "lucide-react";

const chartData = [
  { name: 'Mon', dispensed: 30, reorders: 10 },
  { name: 'Tue', dispensed: 40, reorders: 12 },
  { name: 'Wed', dispensed: 35, reorders: 15 },
  { name: 'Thu', dispensed: 60, reorders: 12 },
  { name: 'Fri', dispensed: 50, reorders: 25 },
  { name: 'Sat', dispensed: 70, reorders: 20 },
  { name: 'Sun', dispensed: 55, reorders: 28 },
];

export default function PharmacyDashboardPage() {
  return (
    <>
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        
        {/* Header Actions */}
        <div className="flex flex-wrap justify-end gap-3 mb-2">
          <Link href="/super-admin/pharmacy/orders">
            <Button variant="outline" className="font-bold text-[#0052CC] border-[#0052CC] hover:bg-blue-50 px-6">
              Manage Orders
            </Button>
          </Link>
          <Link href="/super-admin/pharmacy/prescriptions">
            <Button variant="outline" className="font-bold text-[#0052CC] border-[#0052CC] hover:bg-blue-50 px-6">
              Verify Prescriptions
            </Button>
          </Link>
          <Link href="/super-admin/pharmacy/dispensing">
            <Button variant="outline" className="font-bold text-[#0052CC] border-[#0052CC] hover:bg-blue-50 px-6">
              Dispense
            </Button>
          </Link>
          <Link href="/super-admin/pharmacy/reports">
            <Button variant="outline" className="font-bold text-[#0052CC] border-[#0052CC] hover:bg-blue-50 px-6">
              View Reports
            </Button>
          </Link>
          <Link href="/super-admin/pharmacy/inventory">
            <Button variant="primary" className="bg-[#0052CC] hover:bg-blue-700 font-bold px-6">
              View Inventory
            </Button>
          </Link>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          
          <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
              <Hexagon size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Medicines in stock</p>
              <p className="text-2xl font-bold text-[#0A2540] dark:text-white mb-2">1,284</p>
              <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowUp size={12} /> 3.2% this week
              </p>
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
              <AlertTriangle size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Low-stock items</p>
              <p className="text-2xl font-bold text-[#0A2540] dark:text-white mb-2">23</p>
              <p className="text-[10px] font-bold text-red-500 flex items-center gap-0.5">
                <ArrowUp size={12} /> 5 since yesterday
              </p>
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Expiring in 30 days</p>
              <p className="text-2xl font-bold text-[#0A2540] dark:text-white mb-2">9</p>
              <p className="text-[10px] font-bold text-red-500">
                Review recommended
              </p>
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
              <DollarSign size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Today's sales</p>
              <p className="text-2xl font-bold text-[#0A2540] dark:text-white mb-2">Rs 84,600</p>
              <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowUp size={12} /> 12% vs yesterday
              </p>
            </div>
          </Card>

        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Chart Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold text-[#0A2540] dark:text-white">Drug consumption trend</h3>
                <button className="flex items-center gap-1 text-xs font-bold text-[#0052CC]">
                  Last 7 days <ChevronDown size={14} />
                </button>
              </div>

              {/* Custom Legend */}
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#1B5E20]"></div>
                  <span className="text-[11px] font-semibold text-slate-500">Dispensed units</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#E65100]"></div>
                  <span className="text-[11px] font-semibold text-slate-500">Reorders raised</span>
                </div>
              </div>

              {/* Chart */}
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={false} // Hidden in mockup
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      labelStyle={{ fontSize: '11px', color: '#64748B', marginBottom: '4px' }}
                    />
                    <Line 
                      type="linear" 
                      dataKey="dispensed" 
                      stroke="#1B5E20" 
                      strokeWidth={2} 
                      dot={false}
                      activeDot={{ r: 6, fill: '#1B5E20' }}
                    />
                    <Line 
                      type="linear" 
                      dataKey="reorders" 
                      stroke="#E65100" 
                      strokeWidth={2} 
                      dot={false}
                      activeDot={{ r: 6, fill: '#E65100' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Supplier Performance Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-[#0A2540] dark:text-white">Supplier performance</h3>
                <button className="text-xs font-bold text-[#0052CC]">
                  View all
                </button>
              </div>

              <div className="space-y-0">
                {[
                  { id: 'CH', name: 'Ceylon Healthcare Distributors', time: 'Avg. delivery 1.4 days', score: '98%' },
                  { id: 'LP', name: 'Lanka Pharma Supplies', time: 'Avg. delivery 2.1 days', score: '91%' },
                  { id: 'MW', name: 'MedWell Wholesale', time: 'Avg. delivery 3.0 days', score: '84%' },
                ].map((supplier, idx, arr) => (
                  <div key={supplier.id} className={`flex items-center justify-between py-4 ${idx !== arr.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-[#F0F5FF] text-[#0052CC] text-xs font-bold flex items-center justify-center shrink-0">
                        {supplier.id}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0A2540] dark:text-white mb-0.5">{supplier.name}</p>
                        <p className="text-[10px] font-medium text-slate-400">{supplier.time}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#0052CC]">{supplier.score}</span>
                  </div>
                ))}
              </div>
            </Card>

          </div>

          {/* Right Column (Span 1) */}
          <div className="lg:col-span-1">
            <Card className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-[#0A2540] dark:text-white">Stock alerts</h3>
                <button className="text-xs font-bold text-[#0052CC]">
                  Manage
                </button>
              </div>

              <div className="space-y-0">
                
                {/* Alert 1 */}
                <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-4 h-6 rounded-sm bg-slate-200 flex flex-col justify-end overflow-hidden shrink-0">
                      <div className="h-2 w-full bg-red-600"></div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0A2540] dark:text-white mb-0.5">Amoxicillin 500mg</p>
                      <p className="text-[10px] font-medium text-slate-400 tracking-wide uppercase">BATCH AX219 · 12 units left</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-wider shrink-0">
                    Critical
                  </span>
                </div>

                {/* Alert 2 */}
                <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-4 h-6 rounded-sm bg-slate-200 flex flex-col justify-end overflow-hidden shrink-0">
                      <div className="h-3 w-full bg-orange-400"></div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0A2540] dark:text-white mb-0.5">Metformin 850mg</p>
                      <p className="text-[10px] font-medium text-slate-400 tracking-wide uppercase">BATCH MF087 · 34 units left</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-wider shrink-0">
                    Low
                  </span>
                </div>

                {/* Alert 3 */}
                <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-4 h-6 rounded-sm bg-slate-200 flex flex-col justify-end overflow-hidden shrink-0">
                      <div className="h-3 w-full bg-orange-400"></div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0A2540] dark:text-white mb-0.5">Salbutamol Inhaler</p>
                      <p className="text-[10px] font-medium text-slate-400 tracking-wide uppercase">BATCH SB402 · Expires in 14 days</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-wider shrink-0">
                    Expiring
                  </span>
                </div>

                {/* Alert 4 */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-4 h-6 rounded-sm bg-slate-200 flex flex-col justify-end overflow-hidden shrink-0">
                      <div className="h-5 w-full bg-emerald-500"></div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0A2540] dark:text-white mb-0.5">Paracetamol 500mg</p>
                      <p className="text-[10px] font-medium text-slate-400 tracking-wide uppercase">BATCH PC118 · 620 units left</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wider shrink-0">
                    Healthy
                  </span>
                </div>

              </div>
            </Card>
          </div>

        </div>
      </div>
    </>
  );
}
