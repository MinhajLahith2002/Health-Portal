"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, Save, ArrowLeft, CheckCircle2, ShieldCheck, Building, Briefcase } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { superAdminService } from "@/services/superadmin.service";
import toast from "react-hot-toast";

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "Doctor",
    department: "General Medicine",
    staffId: "",
    accountStatus: "ACTIVE"
  });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await superAdminService.getStaffById(staffId);
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          role: data.role || "Doctor",
          department: data.department || "General Medicine",
          staffId: data.staffId || "",
          accountStatus: data.accountStatus || "ACTIVE"
        });
      } catch (error) {
        toast.error("Failed to load staff details");
        router.push("/super-admin/staff");
      } finally {
        setIsLoading(false);
      }
    };
    if (staffId) {
      fetchStaff();
    }
  }, [staffId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await superAdminService.updateStaffDetails(staffId, formData);
      toast.success("Staff member updated successfully!");
      router.push("/super-admin/staff");
    } catch (error) {
      toast.error("Failed to update staff member");
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col w-full min-h-screen bg-slate-50 items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#0052CC]/30 border-t-[#0052CC] animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-500">Loading staff details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50">
      
      {/* Top Navigation Bar */}
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/super-admin/staff" className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Edit Staff Profile</h1>
            <p className="text-xs text-slate-500 font-medium">Update details for {formData.firstName} {formData.lastName}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto p-6 lg:p-8">
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0052CC] flex items-center justify-center shrink-0">
                <User size={16} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-slate-400" />
                  </div>
                  <input 
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 outline-none transition-all text-sm"
                    placeholder="Enter first name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-slate-400" />
                  </div>
                  <input 
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 outline-none transition-all text-sm"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-slate-400" />
                  </div>
                  <input 
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 outline-none transition-all text-sm"
                    placeholder="email@healthbridge.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-slate-400" />
                  </div>
                  <input 
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 outline-none transition-all text-sm"
                    placeholder="+94 7X XXX XXXX"
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0052CC] flex items-center justify-center shrink-0">
                <Briefcase size={16} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Employment Details</h2>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">System Role</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck size={16} className="text-slate-400" />
                  </div>
                  <select 
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 outline-none transition-all text-sm appearance-none bg-white"
                  >
                    <option value="Doctor">Doctor</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Admin">Hospital Admin</option>
                    <option value="Lab Officer">Lab Officer</option>
                    <option value="Pharmacist">Pharmacist</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Department</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building size={16} className="text-slate-400" />
                  </div>
                  <select 
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0052CC] focus:ring-2 focus:ring-[#0052CC]/20 outline-none transition-all text-sm appearance-none bg-white"
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Link href="/super-admin/staff">
              <button 
                type="button"
                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </Link>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#0052CC] hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-[#0052CC]/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
