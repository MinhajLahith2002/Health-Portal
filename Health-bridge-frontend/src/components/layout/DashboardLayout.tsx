"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/ui/Sidebar";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "./Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { AUTH_CHANGE_EVENT, getStoredUser, AuthUser } from "@/lib/auth";

export interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  userRole?: string;
  userName?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  pageTitle = "Dashboard",
  userRole,
  userName,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Logged-in user (read after mount so server and client HTML match)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      setAuthUser(getStoredUser());
      setAuthChecked(true);
    };
    loadUser();

    // Keep in sync when the user logs in / logs out
    window.addEventListener(AUTH_CHANGE_EVENT, loadUser);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, loadUser);
  }, []);

  // Props (if a page passes them) win, otherwise use the logged-in user
  const effectiveRole = userRole ?? authUser?.role;
  const effectiveName = userName ?? authUser?.fullName ?? authUser?.email;

  // Ready once we know the role: either passed by the page, or read from storage.
  // Until then the sidebar/navbar are hidden (space is kept) so the wrong
  // default "Patient" menu never flashes on screen.
  const ready = !!userRole || authChecked;
  const hiddenUntilReady = ready ? "contents" : "contents invisible";

  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 font-sans antialiased selection:bg-blue-500 dark:text-slate-100 selection:text-white">
        {/* Sidebar Navigation */}
        <div className={hiddenUntilReady}>
          <Sidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
            userRole={effectiveRole}
            userName={effectiveName}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-slate-50">
          <div className={hiddenUntilReady}>
            <Navbar
              title={pageTitle}
              onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
              userName={effectiveName}
              userRole={effectiveRole}
            />
          </div>

          <main className="flex-1 px-4 md:px-6 py-4 w-full space-y-6">
            {children}
          </main>

          <Footer />
        </div>
      </div>
    </ToastProvider>
  );
};

export default DashboardLayout;
