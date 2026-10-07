"use client";

import React, { useState } from "react";
import { Building2, Mail, Phone, MapPin, FileText, User, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddHospitalPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call for now (Will be wired to backend later)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/super-admin/hospitals");
      }, 1500);
    }, 1000);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Hospital Added Successfully</h2>
        <p className="text-slate-500 text-lg">Redirecting back to hospital list...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/super-admin/hospitals" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Hospital</h1>
          <p className="text-sm text-slate-500 font-medium">Register a new hospital to the HealthBridge network</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        
        {/* Basic Info Section */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Hospital Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Hospital Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-slate-400" />
                </div>
                <input required type="text" className="pl-12 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" placeholder="e.g. City General Hospital" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Registration / License Number <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <input required type="text" className="pl-12 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" placeholder="e.g. REG-2023-987" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contact Phone <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input required type="tel" className="pl-12 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" placeholder="+1 (555) 000-0000" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Primary Address <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <textarea required rows={3} className="pl-12 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none" placeholder="Full street address..." />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Account Section */}
        <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Hospital Admin Account
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">This master account will be created automatically. Credentials will be sent to the email provided below.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Admin Full Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input required type="text" className="pl-12 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white" placeholder="e.g. Dr. Jane Smith" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Admin Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input required type="email" className="pl-12 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white" placeholder="admin@hospital.com" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 sm:p-8 bg-white flex items-center justify-end gap-4">
          <Link href="/super-admin/hospitals" className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding Hospital...
              </>
            ) : (
              "Add Hospital"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
