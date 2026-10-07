"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/Sidebar";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { getToken, getStoredUser, AuthUser } from "@/lib/auth";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isMounted = useRef(true);
  const hasChecked = useRef(false);

  // Dynamically determine the title based on the URL
  let pageTitle = "Super Admin Workspace";
  if (pathname.includes("/dashboard")) pageTitle = "Super Admin Dashboard";
  else if (pathname.includes("/analytics")) pageTitle = "System Analytics";
  else if (pathname.includes("/audit-logs")) pageTitle = "Audit Logs";
  else if (pathname.includes("/users")) pageTitle = "User Management";
  else if (pathname.includes("/staff")) pageTitle = "Staff Management";
  else if (pathname.includes("/roles")) pageTitle = "Roles & Permissions";
  else if (pathname.includes("/hospitals")) pageTitle = "Hospital Management";
  else if (pathname.includes("/doctors")) pageTitle = "Doctor Management";
  else if (pathname.includes("/pharmacy")) pageTitle = "Pharmacy Management";
  else if (pathname.includes("/laboratories")) pageTitle = "Laboratory Management";
  else if (pathname.includes("/insurance")) pageTitle = "Insurance Management";
  else if (pathname.includes("/settings")) pageTitle = "Settings";

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const token = getToken();
    const userData = getStoredUser();

    if (!token || !userData) {
      router.replace("/login");
      return;
    }

    if (userData.role !== "SUPER_ADMIN" && userData.role !== "ADMIN") {
      // Optional: redirect to their own dashboard if not authorized
      // router.replace("/dashboard");
    }

    if (isMounted.current) {
      setUser(userData);
      setLoading(false);
    }

    return () => {
      isMounted.current = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 font-sans antialiased selection:bg-blue-500 dark:text-slate-100 selection:text-white">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          userRole="SUPER_ADMIN" // Hardcode for super-admin just to be 100% safe, or use user.role
          userName={user.fullName}
        />

        <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-50">
          <Navbar
            title={pageTitle}
            onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
            userName={user.fullName}
            userRole="SUPER_ADMIN"
          />

          <main className="flex-1 px-4 md:px-6 py-4 w-full space-y-6">
            {children}
          </main>

          <Footer />
        </div>
      </div>
    </ToastProvider>
  );
}
