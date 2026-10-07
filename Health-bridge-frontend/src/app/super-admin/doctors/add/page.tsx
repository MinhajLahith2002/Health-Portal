"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import {
  User,
  Briefcase,
  Key,
  Clock,
  Folder,
  Info,
  Calendar,
  Image as ImageIcon,
  UserPlus,
  Save,
  UploadCloud
} from "lucide-react";

export default function AddDoctorPage() {
  const [activeSection, setActiveSection] = useState("Personal Info");

  const navItems = [
    { name: "Personal Info", icon: User },
    { name: "Professional Info", icon: Briefcase },
    { name: "Account Info", icon: Key },
    { name: "Availability", icon: Clock },
    { name: "Documents", icon: Folder },
  ];

  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const [selectedDays, setSelectedDays] = useState(["M", "T", "W", "T", "F"]);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start relative">
          
          {/* Left Navigation Column - Sticky */}
          <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 space-y-4">
            
            {/* Nav Card */}
            <div className="bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <h3 className="text-[#0A2540] dark:text-white font-bold mb-4 px-2">Add Doctor</h3>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setActiveSection(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        isActive 
                          ? "bg-blue-50 text-[#0052CC] dark:bg-blue-900/30 dark:text-blue-400" 
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {item.name}
                      <Icon size={16} />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Security Info Card */}
            <div className="bg-[#0052CC] rounded-2xl p-5 text-white shadow-lg shadow-blue-900/20">
              <Info size={24} className="mb-3 opacity-90" />
              <h4 className="font-bold mb-2">Data Security</h4>
              <p className="text-xs text-blue-100 leading-relaxed opacity-90">
                All information entered is encrypted and stored in compliance with HIPAA and GDPR regulations.
              </p>
            </div>
            
          </div>

          {/* Right Content Column - Form */}
          <div className="flex-1 space-y-8 min-w-0">
            
            {/* 1. Personal Information */}
            <Card className="p-6 md:p-8" id="personal-info">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 bg-blue-50 text-[#0052CC] rounded-xl"><User size={20} /></div>
                <h2 className="text-xl font-bold text-[#0A2540] dark:text-white">Personal Information</h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-8">
                {/* Photo Upload */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer relative overflow-hidden">
                    <ImageIcon size={24} className="mb-1" />
                    <span className="text-[10px] font-semibold">Upload Photo</span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Profile Photo</p>
                    <p className="text-[10px] text-slate-500">(Max 2MB)</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Full Name <span className="text-red-500">*</span></label>
                    <Input placeholder="Dr. John Doe" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Date of Birth <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Input placeholder="mm/dd/yyyy" className="pr-10" />
                      <Calendar size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Gender <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none">
                        <option>Select Gender</option>
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                      <div className="absolute right-3 top-3 text-slate-500 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">National ID / Passport <span className="text-red-500">*</span></label>
                    <Input placeholder="Enter ID number" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Phone Number <span className="text-red-500">*</span></label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 text-sm font-medium">+1</span>
                      <Input placeholder="(555) 000-0000" className="rounded-l-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Email Address <span className="text-red-500">*</span></label>
                    <Input placeholder="doctor@hospital.com" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Residential Address</label>
                    <Input placeholder="Enter full address" />
                  </div>
                </div>
              </div>
            </Card>

            {/* 2. Professional Information */}
            <Card className="p-6 md:p-8" id="professional-info">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl"><Briefcase size={20} /></div>
                <h2 className="text-xl font-bold text-[#0A2540] dark:text-white">Professional Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Doctor ID</label>
                  <Input defaultValue="DOC-2023-894" disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Department <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none">
                      <option>Select Department</option>
                      <option>Cardiology</option>
                      <option>Neurology</option>
                    </select>
                    <div className="absolute right-3 top-3 text-slate-500 pointer-events-none">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Specialization <span className="text-red-500">*</span></label>
                  <Input placeholder="e.g. Interventional Cardiology" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Qualifications</label>
                  <Input placeholder="MD, PhD, etc." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Medical License # <span className="text-red-500">*</span></label>
                  <Input placeholder="License Number" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">License Expiry Date <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Input placeholder="mm/dd/yyyy" className="pr-10" />
                    <Calendar size={16} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Years of Experience</label>
                  <Input placeholder="e.g. 10" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Employment Type <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none">
                      <option>Full-Time</option>
                      <option>Part-Time</option>
                      <option>Contract</option>
                    </select>
                    <div className="absolute right-3 top-3 text-slate-500 pointer-events-none">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 3. Account Information */}
            <Card className="p-6 md:p-8" id="account-info">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Key size={20} /></div>
                <h2 className="text-xl font-bold text-[#0A2540] dark:text-white">Account Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">System Username <span className="text-red-500">*</span></label>
                  <Input placeholder="@username" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Temporary Password <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <Input defaultValue="DocPass2024!" type="password" />
                    <Button variant="outline" className="shrink-0 text-blue-600 border-blue-200 hover:bg-blue-50 bg-blue-50/50">
                      Generate
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">System Role</label>
                  <Input defaultValue="Doctor" disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Account Status</label>
                  <div className="flex items-center gap-6 h-10">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" defaultChecked className="w-4 h-4 text-[#0052CC] border-slate-300 focus:ring-[#0052CC]" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" className="w-4 h-4 text-[#0052CC] border-slate-300 focus:ring-[#0052CC]" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Inactive (Draft)</span>
                    </label>
                  </div>
                </div>
              </div>
            </Card>

            {/* 4. Schedule & Availability */}
            <Card className="p-6 md:p-8" id="availability">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 bg-blue-50 text-[#0052CC] rounded-xl"><Clock size={20} /></div>
                <h2 className="text-xl font-bold text-[#0A2540] dark:text-white">Schedule & Availability</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Working Days <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2">
                    {days.map((day, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                          selectedDays.includes(day)
                            ? "bg-[#0052CC] text-white"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Standard Shift Hours</label>
                  <div className="flex items-center gap-3">
                    <Input defaultValue="09:00 AM" className="text-center" />
                    <span className="text-sm font-medium text-slate-400">to</span>
                    <Input defaultValue="05:00 PM" className="text-center" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Consultation Duration (mins) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 appearance-none">
                      <option>20 Minutes</option>
                      <option>30 Minutes</option>
                      <option>45 Minutes</option>
                      <option>60 Minutes</option>
                    </select>
                    <div className="absolute right-3 top-3 text-slate-500 pointer-events-none">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0A2540] dark:text-slate-300">Max Patients / Day</label>
                  <Input defaultValue="25" />
                </div>
              </div>
            </Card>

            {/* 5. Required Documents */}
            <Card className="p-6 md:p-8" id="documents">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl"><Folder size={20} /></div>
                <h2 className="text-xl font-bold text-[#0A2540] dark:text-white">Required Documents</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {[
                  { title: "Medical License", icon: UploadCloud },
                  { title: "Medical Degree", icon: Folder },
                  { title: "Specialist Certificate", icon: Folder },
                  { title: "National ID Copy", icon: Folder },
                ].map((doc, idx) => (
                  <div key={idx} className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <doc.icon size={24} className="text-slate-400 mb-3" />
                    <h4 className="text-sm font-bold text-[#0A2540] dark:text-slate-200 mb-1">{doc.title}</h4>
                    <p className="text-[11px] text-slate-400 mb-3">PDF or JPEG, max 5MB</p>
                    <Button variant="outline" size="sm" className="bg-blue-50 text-[#0052CC] border-blue-100 hover:bg-blue-100 font-bold text-xs">
                      Browse Files
                    </Button>
                  </div>
                ))}

              </div>
            </Card>

          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 z-40 px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button variant="outline" className="font-bold text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200 px-6">
            Cancel
          </Button>
          <Button variant="outline" leftIcon={<Save size={16} />} className="font-bold text-slate-700 border-slate-200 hover:bg-slate-50 px-6">
            Save as Draft
          </Button>
          <Button variant="primary" leftIcon={<UserPlus size={16} />} className="font-bold bg-[#0052CC] hover:bg-blue-700 px-6 shadow-sm">
            Save Doctor
          </Button>
        </div>

      </div>
    </>
  );
}
