"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";

import { 
  ChevronRight,
  Hourglass,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Filter,
  RotateCcw,
  MoreVertical,
  X,
  Phone,
  ExternalLink,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from "lucide-react";

const mockOrders = [
  {
    id: "ORD-1024",
    patient: "Sarah Perera",
    rxId: "RX-9842",
    items: 3,
    date: "10 Aug 2026",
    type: "Prescription",
    fulfilment: "Home Delivery",
    amount: "LKR 4,250",
    status: "Processing"
  },
  {
    id: "ORD-1025",
    patient: "Nimal Silva",
    rxId: "RX-9843",
    items: 2,
    date: "10 Aug 2026",
    type: "Refill",
    fulfilment: "Pharmacy Pickup",
    amount: "LKR 2,800",
    status: "Ready"
  },
  {
    id: "ORD-1026",
    patient: "Fahim Ahamed",
    rxId: "RX-9844",
    items: 4,
    date: "10 Aug 2026",
    type: "Prescription",
    fulfilment: "Home Delivery",
    amount: "LKR 6,500",
    status: "New"
  }
];

export default function PharmacyOrdersPage() {
  const [activeTab, setActiveTab] = useState("All Orders (79)");
  const tabs = ["All Orders (79)", "New (18)", "Prescription Verification", "Processing (12)", "Ready (8)", "Out for Delivery", "Completed"];
  
  // State for controlling the drawer
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-600"></span> Processing
          </span>
        );
      case "Ready":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Ready
          </span>
        );
      case "New":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> New
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Custom Header Area */}
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Link href="/super-admin/pharmacy" className="hover:text-slate-600 transition-colors">Pharmacy</Link>
            <ChevronRight size={12} />
            <span className="text-[#0A2540] dark:text-slate-200">Order Management</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A2540] dark:text-white">
            Order Management
          </h1>
        </div>
      </div>

      <div className="mx-auto space-y-6 relative">
              
        {/* Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                
                <Card className="p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between h-[100px]">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-500">New Orders</p>
                    <div className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700">NEW</div>
                  </div>
                  <p className="text-2xl font-bold text-[#0A2540]">18</p>
                </Card>

                <Card className="p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between h-[100px]">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-500">Processing</p>
                    <Hourglass size={18} className="text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold text-[#0A2540]">12</p>
                </Card>

                <Card className="p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between h-[100px]">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-500">Ready for Pickup</p>
                    <ShoppingBag size={18} className="text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold text-[#0A2540]">8</p>
                </Card>

                <Card className="p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between h-[100px]">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-500">Out for Delivery</p>
                    <Truck size={18} className="text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-[#0A2540]">6</p>
                </Card>

                <Card className="p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between h-[100px]">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-slate-500">Completed Today</p>
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold text-[#0A2540]">35</p>
                </Card>

              </div>

              {/* Order List Card */}
              <Card className="rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
                
                {/* Tabs */}
                <div className="flex items-center gap-6 px-6 pt-4 border-b border-slate-100 overflow-x-auto scrollbar-none">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
                        activeTab === tab 
                          ? "border-[#0052CC] text-[#0052CC]" 
                          : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 px-2">
                      <Filter size={14} /> Filters:
                    </span>
                    <select className="text-xs font-bold text-[#0A2540] bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none">
                      <option>Order Type (All)</option>
                    </select>
                    <select className="text-xs font-bold text-[#0A2540] bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none">
                      <option>Fulfilment (All)</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="mm/dd/yyyy"
                      className="text-xs font-bold text-[#0A2540] bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none w-32 placeholder:text-slate-400"
                    />
                  </div>
                  <button className="flex items-center gap-1 text-xs font-bold text-[#0052CC] hover:text-blue-700 px-2">
                    <RotateCcw size={12} /> Reset
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <Table className="border-0">
                    <TableHeader className="bg-white">
                      <TableRow className="hover:bg-transparent border-b border-slate-100">
                        <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4 pl-6">ORDER ID</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">PATIENT</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">RX ID / ITEMS</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">ORDER DATE</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">TYPE & FULFILMENT</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">TOTAL AMOUNT</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4">STATUS</TableHead>
                        <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider py-4 pr-6 text-right">ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockOrders.map((order, idx) => (
                        <TableRow 
                          key={idx} 
                          onClick={() => setSelectedOrder(order.id)}
                          className="border-b border-slate-50 last:border-0 hover:bg-blue-50/50 cursor-pointer transition-colors"
                        >
                          <TableCell className="pl-6 py-4">
                            <span className="text-xs font-bold text-[#0052CC]">{order.id}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-xs font-bold text-[#0A2540]">{order.patient}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-slate-500">{order.rxId}</span>
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold">{order.items} items</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-xs font-medium text-slate-600">{order.date}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <p className="text-xs font-bold text-[#0A2540]">{order.type}</p>
                            <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                              {order.fulfilment === "Home Delivery" ? <Truck size={10} /> : <ShoppingBag size={10} />}
                              {order.fulfilment}
                            </p>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-xs font-bold text-[#0A2540]">{order.amount}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            {renderStatusBadge(order.status)}
                          </TableCell>
                          <TableCell className="py-4 pr-6 text-right">
                            <button className="text-slate-400 hover:text-slate-700">
                              <MoreVertical size={16} />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Footer Pagination */}
                <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500">Showing 1-3 of 79 orders</span>
                  <div className="flex items-center gap-2">
                    <button className="p-1 rounded bg-white border border-slate-200 text-slate-400 hover:text-slate-700">
                      <ChevronLeft size={14} />
                    </button>
                    <button className="p-1 rounded bg-white border border-slate-200 text-slate-400 hover:text-slate-700">
                      <ChevronRightIcon size={14} />
                    </button>
                  </div>
                </div>

          </Card>
        </div>

        {/* Drawer Overlay */}
        {selectedOrder && (
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />
        )}

        {/* Side Panel (Right) - Slide out drawer */}
        <div 
          className={`fixed top-0 right-0 h-full w-[420px] bg-white border-l border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-col shrink-0 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
            selectedOrder ? "translate-x-0" : "translate-x-full"
          }`}
        >
            
            {/* Panel Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-[#0A2540] dark:text-white">Order Details</h2>
                <span className="text-xs font-bold text-[#0052CC]">{selectedOrder || "ORD-1024"}</span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors p-1.5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Panel Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              
              {/* Timeline */}
              <div className="bg-[#F0F5FF] rounded-xl p-5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Processing Timeline</p>
                <div className="relative pl-3 space-y-5 before:content-[''] before:absolute before:left-3.5 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-blue-200">
                  
                  {/* Step 1 */}
                  <div className="relative flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#0052CC] mt-1.5 shrink-0 z-10"></div>
                    <div>
                      <p className="text-xs font-bold text-[#0A2540]">Order Placed</p>
                      <p className="text-[10px] font-medium text-slate-500">10 Aug, 09:30 AM</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#0052CC] mt-1.5 shrink-0 z-10"></div>
                    <div>
                      <p className="text-xs font-bold text-[#0A2540]">Prescription Verified</p>
                      <p className="text-[10px] font-medium text-slate-500">10 Aug, 10:15 AM</p>
                    </div>
                  </div>

                  {/* Step 3 (Current) */}
                  <div className="relative flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0 z-10 ring-4 ring-orange-100"></div>
                    <div>
                      <p className="text-xs font-bold text-orange-600">Processing (Current)</p>
                      <p className="text-[10px] font-medium text-slate-500">Assembling medicines...</p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5 shrink-0 z-10"></div>
                    <div>
                      <p className="text-xs font-bold text-slate-400">Ready for Delivery</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Patient Card */}
              <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0052CC] flex items-center justify-center font-bold text-sm shrink-0">
                  SP
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0A2540]">Sarah Perera</p>
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Phone size={10} /> +94 77 123 4567
                  </p>
                </div>
              </div>

              {/* Grid Info Boxes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prescription ID</p>
                  <a href="#" className="flex items-center gap-1 text-xs font-bold text-[#0052CC] hover:underline">
                    RX-9842 <ExternalLink size={10} />
                  </a>
                </div>
                <div className="border border-slate-200 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fulfilment</p>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[#0A2540]">
                    <Truck size={12} className="text-[#0052CC]" /> Home Delivery
                  </p>
                </div>
              </div>

              {/* Medicines List */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Medicines (3 items)</p>
                
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  
                  {/* Item 1 */}
                  <div className="p-4 border-b border-slate-100 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#0A2540] mb-0.5">Amoxicillin 500mg</p>
                      <p className="text-[10px] font-medium text-slate-500">Capsules • 1-1-1 (5 days)</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase rounded mb-1">In Stock</span>
                      <p className="text-[10px] font-bold text-[#0A2540]">Qty: 15</p>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="p-4 border-b border-slate-100 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#0A2540] mb-0.5">Paracetamol 500mg</p>
                      <p className="text-[10px] font-medium text-slate-500">Tablets • SOS</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 bg-orange-50 text-orange-600 text-[9px] font-bold uppercase rounded mb-1">Low Stock</span>
                      <p className="text-[10px] font-bold text-[#0A2540]">Qty: 20</p>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="p-4 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#0A2540] mb-0.5">Vitamin C 250mg</p>
                      <p className="text-[10px] font-medium text-slate-500">Chewable • 1-0-0 (10 days)</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase rounded mb-1">In Stock</span>
                      <p className="text-[10px] font-bold text-[#0A2540]">Qty: 10</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Order Summary</p>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>Subtotal</span>
                    <span>LKR 3,850.00</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>Delivery Fee</span>
                    <span>LKR 400.00</span>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-[#0A2540]">Total</span>
                  <span className="text-base font-bold text-[#0052CC]">LKR 4,250.00</span>
                </div>
              </div>

            </div>

            {/* Panel Actions (Sticky bottom) */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex items-center gap-3">
              <Button variant="outline" className="flex-1 font-bold text-slate-700 border-slate-200 hover:bg-slate-50">
                Print Label
              </Button>
              <Button variant="primary" className="flex-1 font-bold bg-[#0052CC] hover:bg-blue-700">
                Mark as Ready
              </Button>
            </div>

        </div>
    </>
  );
}
