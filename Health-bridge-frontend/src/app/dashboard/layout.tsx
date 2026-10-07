"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/ui/Sidebar";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { getToken, getStoredUser, AuthUser, AUTH_CHANGE_EVENT } from "@/lib/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export default function DashboardLayout({
  children,
  pageTitle = "Dashboard",
}: DashboardLayoutProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const verifyAuth = () => {
      const token = getToken();
      const userData = getStoredUser();

      if (!token || !userData) {
        console.log('🔀 No auth - Redirecting to login...');
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        } else {
          router.replace("/login");
        }
        return;
      }

      if (isMounted.current) {
        setUser(userData);
        setLoading(false);
      }
    };

    verifyAuth();

    if (typeof window !== "undefined") {
      window.addEventListener(AUTH_CHANGE_EVENT, verifyAuth);
    }

    return () => {
      isMounted.current = false;
      if (typeof window !== "undefined") {
        window.removeEventListener(AUTH_CHANGE_EVENT, verifyAuth);
      }
    };
  }, [router]);

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-500 selection:text-white">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          userRole={user.role}
          userName={user.fullName}
        />

        <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-50">
          <Navbar
            title={pageTitle}
            onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
            userName={user.fullName}
            userRole={user.role}
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