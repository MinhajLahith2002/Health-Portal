"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "@/components/ui/Sidebar";
import { useAuth } from "@/hooks/useAuth";

interface AppointmentModuleShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  action?: ReactNode;
  showTopNav?: boolean;
}

export default function AppointmentModuleShell({
  title,
  subtitle,
  children,
  action,
  showTopNav = false,
}: AppointmentModuleShellProps) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        userRole={user?.role ?? "PATIENT"}
        userName={user?.fullName ?? "User"}
      />

      <main className="min-w-0 flex-1">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-600">
                    Appointment Management
                  </p>
                  <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
                  <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                </div>
                {action}
              </div>
            </div>

            {showTopNav && (
              <div className="border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:px-6">
                <div className="text-sm text-slate-500">Appointment shortcuts are handled through the sidebar and page actions.</div>
              </div>
            )}
          </section>

          {children}
        </div>
      </main>
    </div>
  );
}
