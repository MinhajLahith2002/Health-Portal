"use client";
import { useEffect } from "react";
import { clearAuthData } from "@/lib/auth";

export default function LogoutPage() {
  useEffect(() => {
    clearAuthData();
    window.location.href = "/login";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-600">Signing out...</p>
      </div>
    </div>
  );
}
