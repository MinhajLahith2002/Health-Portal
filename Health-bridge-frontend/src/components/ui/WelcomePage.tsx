"use client";

import React from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  User,
  FileText,
  ShoppingBag,
  FlaskConical,
  Clock,
  AlertTriangle,
  MessageSquareText,
} from "lucide-react";
import Feedback from "@/components/support/feedback";
export interface WelcomePageProps {
  onBookAppointment?: () => void;
  onContinueGuest?: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onBookAppointment,
  onContinueGuest,
}) => {
  return (
    <div className="relative min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-[#0052CC] selection:text-white flex flex-col">
      {/* Top Header / Navigation */}
      <header className="absolute top-0 left-0 z-20 w-full px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between bg-white/75 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0052CC] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm1 14h-2v-3H8v-2h3V7h2v3h3v2h-3v3z" />
            </svg>
          </div>
          <span className="font-extrabold text-lg tracking-tight text-[#0F172A]">
            Health <span className="text-[#0052CC]">Bridge</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#0052CC] hover:text-[#0047B3] transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg bg-[#0052CC] hover:bg-[#0047B3] text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section with Hospital Image & Overlay */}
      <section className="relative w-full min-h-screen overflow-hidden bg-white border-b border-slate-100 flex items-center">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hospital_hero_bg.jpg"
            alt="Hospital Hallway Background"
            className="w-full h-full object-cover object-center opacity-85"
          />
          {/* Gradient Overlay fading from pure white on the left to translucent on the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-blue-900/30" />
        </div>

        {/* Double Heart & Shield Watermark Line Art (matching Image 1) */}
        <div className="absolute right-12 md:right-28 bottom-16 z-10 pointer-events-none hidden lg:block opacity-75">
          <svg className="w-72 h-72 text-white/90 stroke-current" fill="none" viewBox="0 0 200 200">
            <path strokeWidth="3.5" d="M100 30 C 60 0, 10 40, 100 160 C 190 40, 140 0, 100 30 Z" />
            <path strokeWidth="3.5" d="M120 45 C 80 15, 30 55, 120 175 C 210 55, 160 15, 120 45 Z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full py-12">
          <div className="max-w-xl space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF3FF] text-[#0052CC] text-xs font-semibold border border-blue-100">
              <span className="w-4 h-4 rounded-full bg-[#0052CC] text-white flex items-center justify-center text-[10px]">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <span>Trusted by 10,000+ Patients</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.1]">
              Your Healthcare, <br />
              <span className="text-[#0052CC]">Connected</span>
            </h1>

            {/* Paragraph Subtitle */}
            <p className="text-sm sm:text-base text-[#475569] leading-relaxed font-normal">
              Manage appointments, access medical records, and connect with top healthcare professionals—all in one secure, unified platform designed for your peace of mind.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-6 pt-2">
              <Link
                href="/login"
                onClick={() => {
                  if (onContinueGuest) onContinueGuest();
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0052CC] hover:text-[#0047B3] transition-colors group"
              >
                <span>Continue as Guest</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/appointments/search-doctor"
                onClick={onBookAppointment}
                className="px-6 py-3.5 rounded-xl bg-[#0052CC] hover:bg-[#0047B3] text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all"
              >
                Book an Appointment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Care Solutions Feature Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Comprehensive Care Solutions
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Everything you need to manage your health journey, seamlessly integrated into one platform.
          </p>
        </div>

        {/* Feature Cards Grid (Matching Image 1 Exact Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Doctor Consultation (Large Featured Card) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF3FF] text-[#0052CC] flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
                Doctor Consultation
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xl">
                Connect with certified specialists instantly. Schedule in-person visits or secure video consultations from the comfort of your home. Access a vast network of top-rated professionals.
              </p>
            </div>
          </div>

          {/* Card 2: Medical Records */}
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E6F7F5] text-[#0D9488] flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">
                Medical Records
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Securely store and share your complete medical history.
              </p>
            </div>
          </div>

          {/* Card 3: Pharmacy Services */}
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">
                Pharmacy Services
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Manage prescriptions and arrange doorstep medication delivery.
              </p>
            </div>
          </div>

          {/* Card 4: Lab Reports */}
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">
                Lab Reports
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                View test results securely as soon as they are processed.
              </p>
            </div>
          </div>

          {/* Card 5 & 6 Stacked Column */}
          <div className="space-y-6 flex flex-col justify-between">
            {/* Card 5: Insurance Claims */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0F172A]">Insurance Claims</h4>
                <p className="text-xs text-slate-500 mt-0.5">Streamlined processing.</p>
              </div>
            </div>

            {/* Card 6: Emergency Support */}
            <div className="bg-white rounded-2xl border border-slate-100 border-l-4 border-l-[#EF4444] p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0F172A]">Emergency Support</h4>
                <p className="text-xs text-slate-500 mt-0.5">24/7 SOS assistance.</p>
              </div>
            </div>

            {/* Card 7: Feedback */}
            <div className="bg-white rounded-2xl border border-slate-100 border-l-4 border-l-[#0EA5E9] p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center shrink-0">
                <MessageSquareText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0F172A]">Feedback</h4>
                <p className="text-xs text-slate-500 mt-0.5">Share your experience.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Feedback />
      {/* Footer */}
      <footer className="mt-auto border-t border-slate-100 py-8 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Health Bridge. All rights reserved.</p>
          <div className="flex items-center gap-6 font-medium">
            <a href="#privacy" className="hover:text-[#0052CC] transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-[#0052CC] transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;
