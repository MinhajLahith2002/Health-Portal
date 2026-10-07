"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  Eye,
  FileText,
  CheckCircle2,
  Check,
  X,
  AlertTriangle,
  FileCheck2,
  FileWarning
} from "lucide-react";

export default function ApplicationReviewPage({ params }: { params: { id: string } }) {
  const [decision, setDecision] = useState<"approve" | "reject" | null>("approve");
  const [rejectReason, setRejectReason] = useState<string>("Missing document");

  return (
    <>
      <div className="mb-6 px-8 py-3 bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex items-center">
        <Link 
          href="/super-admin/doctors/approvals" 
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-[#0052CC] transition-colors border border-slate-200 dark:border-slate-800 rounded-full px-4 py-1.5"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Approvals
        </Link>
      </div>

      <div className="max-w-[1200px] mx-auto pb-12">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
          <Link href="/super-admin/doctors/approvals" className="hover:text-slate-600 transition-colors">Approvals</Link>
          <ChevronRight size={12} />
          <span className="text-[#0A2540] dark:text-slate-200">Dr. Sophia Wilson</span>
        </div>

        {/* Alert Banner */}
        <div className="flex items-start gap-4 p-4 mb-8 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl">
          <div className="w-8 h-8 rounded shrink-0 bg-red-500 flex items-center justify-center text-white mt-0.5">
            <span className="w-2 h-2 bg-white rounded-full"></span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-red-900 dark:text-red-400 mb-1">
              Pending Review — Application #APP-2026-00208
            </h2>
            <p className="text-xs font-medium text-red-700/80 dark:text-red-500/80">
              Submitted Aug 10, 2026 · Awaiting Super Admin decision for 2 days
            </p>
          </div>
        </div>

        {/* Profile Header */}
        <div className="flex items-start gap-5 mb-8 pl-2">
          <div className="w-16 h-16 shrink-0 rounded-full bg-[#EBF3FF] text-[#0052CC] font-bold text-xl flex items-center justify-center">
            SW
          </div>
          <div className="space-y-3">
            <div>
              <h1 className="text-2xl font-bold text-[#0A2540] dark:text-white mb-1">
                Dr. Sophia Wilson
              </h1>
              <p className="text-sm font-medium text-slate-500">
                Dermatologist · City General Hospital · sophia.wilson@hospital.com
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral" className="bg-slate-100 text-slate-700 border-slate-200 text-xs">Dermatology</Badge>
              <Badge variant="neutral" className="bg-slate-100 text-slate-700 border-slate-200 text-xs">Full-Time</Badge>
              <Badge variant="neutral" className="bg-slate-100 text-slate-700 border-slate-200 text-xs">6 Yrs Experience</Badge>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col xl:flex-row gap-6">
          
          {/* Left Column - Details (65%) */}
          <div className="flex-1 space-y-6">
            
            {/* Personal Details */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><User size={16} /></div>
                <h3 className="text-sm font-bold text-[#0A2540] dark:text-white">Personal Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">Date of Birth</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">14 Mar 1991</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">Gender</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Female</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">National ID</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">932741205V</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">Phone Number</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">+1 (555) 214-7788</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">Residential Address</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">14 Lakeview Ave, Springfield</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">Doctor ID</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">DOC-2026-00208</p>
                </div>
              </div>
            </Card>

            {/* Professional Credentials */}
            <Card className="p-6 relative">
              <div className="absolute top-6 right-6">
                <span className="px-2.5 py-1 rounded bg-orange-100 text-orange-800 text-[10px] font-bold">
                  License expires in 11 months
                </span>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Briefcase size={16} /></div>
                <h3 className="text-sm font-bold text-[#0A2540] dark:text-white">Professional Credentials</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">Medical License #</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">MED-778341</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">License Expiry Date</p>
                  <p className="text-sm font-bold text-orange-700">14 Jul 2027</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">Specialization</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Clinical Dermatology</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">Qualifications</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">MD, FRCP</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">Years of Experience</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">6 Years</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 mb-1">Employment Type</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Full-Time</p>
                </div>
              </div>
            </Card>

            {/* Submitted Documents */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><FileText size={16} /></div>
                <h3 className="text-sm font-bold text-[#0A2540] dark:text-white">Submitted Documents</h3>
              </div>
              <div className="space-y-3">
                
                {/* Doc 1 */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-orange-50 text-orange-500 rounded-lg shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Medical License Certificate.pdf</p>
                      <p className="text-[11px] text-slate-400">Uploaded Aug 10, 2026 · 1.2 MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-600">
                      <Check size={14} strokeWidth={3} /> Verified
                    </span>
                    <button className="flex items-center justify-center w-8 h-8 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                      <Eye size={14} />
                    </button>
                  </div>
                </div>

                {/* Doc 2 */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-orange-50 text-orange-500 rounded-lg shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">National ID / Passport.pdf</p>
                      <p className="text-[11px] text-slate-400">Uploaded Aug 10, 2026 · 0.8 MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-600">
                      <Check size={14} strokeWidth={3} /> Verified
                    </span>
                    <button className="flex items-center justify-center w-8 h-8 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                      <Eye size={14} />
                    </button>
                  </div>
                </div>

                {/* Doc 3 */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-red-100 text-red-500 rounded-lg shrink-0">
                      <FileWarning size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Board Certification.pdf</p>
                      <p className="text-[11px] text-slate-400">Not yet uploaded</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 pr-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Missing
                    </span>
                  </div>
                </div>

              </div>
            </Card>

            {/* Verification Checklist */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><CheckCircle2 size={16} /></div>
                <h3 className="text-sm font-bold text-[#0A2540] dark:text-white">Verification Checklist</h3>
              </div>
              <div className="space-y-6 pl-1">
                
                <div className="flex gap-4">
                  <div className="mt-0.5 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Identity confirmed against National ID</p>
                    <p className="text-[11px] text-slate-400">Matched automatically</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-0.5 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Medical license validated with registry</p>
                    <p className="text-[11px] text-slate-400">Sri Lanka Medical Council — active</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-0.5 shrink-0">
                    <div className="w-5 h-5 rounded-md border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Board certification on file</p>
                    <p className="text-[11px] text-slate-400">Document not submitted</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-0.5 shrink-0">
                    <div className="w-5 h-5 rounded-md border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Department capacity confirmed</p>
                    <p className="text-[11px] text-slate-400">Awaiting hospital admin sign-off</p>
                  </div>
                </div>

              </div>
            </Card>

          </div>

          {/* Right Column - Action Panel (35%) */}
          <div className="w-full xl:w-[35%] space-y-6">
            
            {/* Action Card */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-[#0A2540] dark:text-white mb-1">Application Decision</h3>
              <p className="text-[11px] text-slate-500 mb-6 leading-relaxed">
                Approve to grant platform access, or reject with a reason the applicant will receive by email.
              </p>

              {/* Big Toggles */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button 
                  onClick={() => setDecision("approve")}
                  className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all ${
                    decision === "approve" 
                      ? "border-cyan-200 bg-cyan-50 text-cyan-700 shadow-sm" 
                      : "border-slate-100 bg-white hover:border-slate-200 text-slate-400"
                  }`}
                >
                  <Check size={20} className="mb-1" strokeWidth={2.5} />
                  <span className="text-xs font-bold">Approve</span>
                </button>
                <button 
                  onClick={() => setDecision("reject")}
                  className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all ${
                    decision === "reject" 
                      ? "border-red-200 bg-red-50 text-red-600 shadow-sm" 
                      : "border-slate-100 bg-white hover:border-slate-200 text-slate-400"
                  }`}
                >
                  <X size={20} className="mb-1" strokeWidth={2.5} />
                  <span className="text-xs font-bold">Reject</span>
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[11px] font-bold text-[#0A2540] dark:text-slate-300 mb-1.5">Assign Department <span className="text-red-500">*</span></label>
                  <select className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100">
                    <option>Dermatology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#0A2540] dark:text-slate-300 mb-1.5">System Role</label>
                  <select className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100">
                    <option>Doctor</option>
                  </select>
                </div>
              </div>

              {/* Reject Reasons (Conditional or always visible based on Figma, we'll make it conditional for better UX but default shown if rejected) */}
              {decision === "reject" && (
                <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-[11px] font-bold text-[#0A2540] dark:text-slate-300 mb-2">Rejection Reason (if rejecting)</label>
                  <div className="flex flex-wrap gap-2">
                    {["Missing document", "License expired", "Details mismatch", "Duplicate profile"].map(reason => (
                      <button 
                        key={reason}
                        onClick={() => setRejectReason(reason)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors ${
                          rejectReason === reason 
                            ? "bg-[#9A3412] text-white" 
                            : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <textarea 
                  placeholder="Add a note for the applicant — e.g. 'Please upload your Board Certification to complete verification.'"
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 h-24 resize-none"
                ></textarea>
              </div>

              <div className="space-y-3">
                {decision === "approve" ? (
                  <Button variant="primary" leftIcon={<Check size={16} />} className="w-full font-bold bg-[#0052CC] hover:bg-blue-700 justify-center h-10">
                    Approve Registration
                  </Button>
                ) : (
                  <Button variant="primary" leftIcon={<X size={16} />} className="w-full font-bold bg-[#DC2626] hover:bg-red-700 justify-center h-10 shadow-sm border-none">
                    Reject Registration
                  </Button>
                )}
                <Button variant="outline" className="w-full font-bold text-slate-600 border-slate-200 hover:bg-slate-50 justify-center h-10">
                  Request More Info
                </Button>
              </div>
            </Card>

            {/* Timeline Card */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-[#0A2540] dark:text-white mb-6">Activity Timeline</h3>
              
              <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-2 space-y-6 pb-2">
                <div className="relative pl-6">
                  <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#0052CC]"></span>
                  <p className="text-[11px] font-bold text-slate-900 dark:text-white mb-0.5">Application submitted</p>
                  <p className="text-[10px] text-slate-400">Aug 10, 2026 · 9:14 AM</p>
                </div>
                
                <div className="relative pl-6">
                  <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                  <p className="text-[11px] font-bold text-slate-500 mb-0.5">Documents auto-verified (2 of 3)</p>
                  <p className="text-[10px] text-slate-400">Aug 10, 2026 · 9:16 AM</p>
                </div>
                
                <div className="relative pl-6">
                  <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                  <p className="text-[11px] font-bold text-slate-500 mb-0.5">Assigned to Dr. Sarah Williams for review</p>
                  <p className="text-[10px] text-slate-400">Aug 10, 2026 · 11:02 AM</p>
                </div>
              </div>
            </Card>

          </div>
        </div>

      </div>
    </>
  );
}
