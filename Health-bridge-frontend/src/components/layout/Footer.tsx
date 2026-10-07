"use client";

import React from "react";
import Link from "next/link";
import { Shield, Heart, HelpCircle } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white dark:bg-slate-900 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-700 dark:text-slate-300">HealthBridge</span>
        <span>© {new Date().getFullYear()} HealthBridge Systems. All rights reserved.</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-500" /> HIPAA Compliant
        </span>
        <Link href="/dev20-test" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Dev20 Specs
        </Link>
        <a href="#privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Privacy Policy
        </a>
        <a href="#terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Terms of Service
        </a>
      </div>
    </footer>
  );
};

export default Footer;
