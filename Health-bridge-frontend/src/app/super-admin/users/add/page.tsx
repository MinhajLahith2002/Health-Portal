"use client";

import React, { useState } from "react";
import { User, Mail, Phone, Lock, UserPlus, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddUserPage() {
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
        router.push("/super-admin/users");
      }, 1500);
    }, 1000);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">User Added Successfully</h2>
        <p className="text-slate-500 text-lg">Redirecting back to user list...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/super-admin/users" className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add User</h1>
          <p className="text-sm text-slate-500 font-medium">Create a new user account in the HealthBridge system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        
        {/* User Details Section */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            User Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input required type="text" className="pl-12 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" placeholder="e.g. John Doe" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input required type="email" className="pl-12 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" placeholder="e.g. user@healthbridge.lk" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input required type="tel" className="pl-12 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" placeholder="+1 (555) 000-0000" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">System Role <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ShieldCheck className="h-5 w-5 text-slate-400" />
                </div>
                <select required defaultValue="" className="pl-12 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white appearance-none">
                  <option value="" disabled>Select a role...</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="PATIENT">Patient</option>
                  <option value="PHARMACIST">Pharmacist</option>
                  <option value="LAB_OFFICER">Lab Technician</option>
                  <option value="INSURANCE_OFFICER">Insurance Officer</option>
                  <option value="ADMIN">Hospital Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Account Security Section */}
        <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              Account Security
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Set the initial password for this user. They can change it later.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input required type="password" minLength={8} className="pl-12 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white" placeholder="Minimum 8 characters" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input required type="password" minLength={8} className="pl-12 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white" placeholder="Retype password" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 sm:p-8 bg-white flex items-center justify-end gap-4">
          <Link href="/super-admin/users" className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            Cancel
          </Link>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-8 py-3 bg-[#0052CC] hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding User...
              </>
            ) : (
              "Create User"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
