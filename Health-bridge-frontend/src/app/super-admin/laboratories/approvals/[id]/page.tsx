"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import axios from "@/lib/axios";
import { 
  ChevronRight,
  ChevronLeft,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function LaboratoryReviewPage() {
  const params = useParams();
  const id = params?.id || "1";
  const router = useRouter();

  const updateStatus = async (status: string) => {
    try {
      await axios.put(`/admin/laboratories/${id}/status`, { status });
      toast.success(`Laboratory marked as ${status}`);
      router.push('/super-admin/laboratories');
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDownload = (filename: string) => {
    toast.success(`Downloading ${filename}...`);
    setTimeout(() => {
      const blob = new Blob(["Mock PDF Content"], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 800);
  };

  const handleView = (filename: string) => {
    window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        
        <div className="max-w-[1200px] mx-auto space-y-8">
          
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </button>

          {/* Header Profile Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white pb-6 border-b border-slate-100 ">
            
            <div className="flex items-center gap-6">
              {/* Profile Image */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm relative overflow-hidden">
                <Building2 size={40} className="opacity-80" strokeWidth={1.5} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>

              <div>
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                  <Link href="/super-admin/laboratories" className="hover:text-slate-600 transition-colors">Lab Registrations</Link>
                  <ChevronRight size={14} />
                  <span className="text-[#0A2540] ">GreenLine Diagnostics</span>
                </div>
                
                {/* Title and Badges */}
                <div className="flex flex-wrap items-center gap-4 mb-2">
                  <h1 className="text-3xl font-bold text-[#0A2540] tracking-tight">
                    GreenLine Diagnostics
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold shadow-sm">
                    <Clock size={12} strokeWidth={2.5} /> Pending review
                  </span>
                </div>

                {/* Info Text */}
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                  <span>License LAB-WP-2291</span>
                  <span>Submitted 2 days ago</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button onClick={() => updateStatus('Rejected')} variant="outline" className="font-bold text-red-600 bg-red-50 hover:bg-red-100 border-red-50 px-6">
                Reject
              </Button>
              <Button onClick={() => updateStatus('Pending')} variant="outline" className="font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-50 px-6">
                Set Pending
              </Button>
              <Button onClick={() => updateStatus('Approved')} variant="primary" className="font-bold bg-[#0052CC] hover:bg-blue-700 px-6">
                Approve laboratory
              </Button>
            </div>

          </div>

          {/* Main Grid Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column (Core Details) - 65% */}
            <div className="w-full lg:w-[65%] space-y-8">
              
              {/* Overview Card */}
              <Card className="p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h2 className="text-lg font-bold text-[#0A2540] mb-6">Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Owner / Contact Person</p>
                    <p className="text-sm font-bold text-[#0A2540] ">S. Perera</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Registration No.</p>
                    <p className="text-sm font-bold text-[#0A2540] ">LAB-WP-2291</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email</p>
                    <a href="mailto:contact@greenline-labs.lk" className="text-sm font-bold text-[#0052CC] hover:underline">contact@greenline-labs.lk</a>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone</p>
                    <p className="text-sm font-bold text-[#0A2540] ">+94 77 213 4590</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Registered Address</p>
                    <p className="text-sm font-medium text-[#0A2540] ">No. 45, Colombo Road, Negombo, Western Province, Sri Lanka</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Lab Category</p>
                    <p className="text-sm font-bold text-[#0A2540] ">Clinical Pathology & Diagnostics</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Years in Operation</p>
                    <p className="text-sm font-bold text-[#0A2540] ">6 years</p>
                  </div>
                </div>
              </Card>

              {/* Documents Card */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2 px-1">
                  <h2 className="text-lg font-bold text-[#0A2540] ">Legal & registration documents</h2>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">4 files</span>
                </div>

                <Card className="p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                      <div className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-bold tracking-wider">PDF</div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0A2540] mb-0.5">Business_Registration_Certificate.pdf</p>
                      <p className="text-[11px] font-medium text-slate-400">842 KB · Uploaded 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 px-2">
                    <button onClick={() => handleView('Document')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View</button>
                    <button onClick={() => handleDownload('Document.pdf')} className="text-xs font-bold text-[#0052CC] hover:text-blue-700">Download</button>
                  </div>
                </Card>

                <Card className="p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                      <div className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-bold tracking-wider">PDF</div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0A2540] mb-0.5">Laboratory_Operating_License.pdf</p>
                      <p className="text-[11px] font-medium text-slate-400">1.1 MB · Uploaded 2 days ago <span className="text-slate-300">·</span> Verified</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 px-2">
                    <button onClick={() => handleView('Document')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View</button>
                    <button onClick={() => handleDownload('Document.pdf')} className="text-xs font-bold text-[#0052CC] hover:text-blue-700">Download</button>
                  </div>
                </Card>

                <Card className="p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                      <div className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-bold tracking-wider">PDF</div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0A2540] mb-0.5">Tax_Compliance_Certificate.pdf</p>
                      <p className="text-[11px] font-medium text-slate-400">390 KB · Uploaded 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 px-2">
                    <button onClick={() => handleView('Document')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View</button>
                    <button onClick={() => handleDownload('Document.pdf')} className="text-xs font-bold text-[#0052CC] hover:text-blue-700">Download</button>
                  </div>
                </Card>

                <Card className="p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                      <div className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-bold tracking-wider">PDF</div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0A2540] mb-0.5">Owner_NIC_Copy.pdf</p>
                      <p className="text-[11px] font-medium text-slate-400">210 KB · Uploaded 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 px-2">
                    <button onClick={() => handleView('Document')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View</button>
                    <button onClick={() => handleDownload('Document.pdf')} className="text-xs font-bold text-[#0052CC] hover:text-blue-700">Download</button>
                  </div>
                </Card>

              </div>

            </div>

            {/* Right Column (Verification Tools) - 35% */}
            <div className="w-full lg:flex-1 space-y-6">
              
              {/* Checklist Card */}
              <Card className="p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-base font-bold text-[#0A2540] mb-6">Document checklist</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-slate-700 ">Business registration on file</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-slate-700 ">Operating license on file</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-slate-700 ">Tax certificate on file</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle size={16} className="text-orange-500 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-slate-700 ">Insurance certificate missing</span>
                  </div>
                </div>
              </Card>

              {/* Activity Card */}
              <Card className="p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-base font-bold text-[#0A2540] mb-6">Activity</h3>
                
                <div className="relative pl-4 space-y-6 before:content-[''] before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
                  
                  {/* Step 1 */}
                  <div className="relative flex items-start gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 z-10"></div>
                    <div>
                      <p className="text-sm font-bold text-[#0A2540] ">Registration submitted</p>
                      <p className="text-[11px] font-medium text-slate-400">2 days ago · by S. Perera</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative flex items-start gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 z-10"></div>
                    <div>
                      <p className="text-sm font-bold text-[#0A2540] ">Documents uploaded</p>
                      <p className="text-[11px] font-medium text-slate-400">2 days ago · 4 files</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative flex items-start gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300 mt-1 shrink-0 z-10 ring-4 ring-white "></div>
                    <div>
                      <p className="text-sm font-bold text-[#0A2540] ">Awaiting admin review</p>
                      <p className="text-[11px] font-medium text-slate-400">Current status</p>
                    </div>
                  </div>

                </div>
              </Card>

              {/* Notes Card */}
              <Card className="p-6 rounded-3xl border border-slate-100 shadow-sm min-h-[150px] flex flex-col">
                <h3 className="text-base font-bold text-[#0A2540] mb-4">Notes</h3>
                <p className="text-[13px] font-medium text-slate-400 leading-relaxed">
                  No internal notes yet. Notes added here are only visible to admins, not the laboratory.
                </p>
              </Card>

            </div>

          </div>

        </div>
      </div>
    </>
  );
}
