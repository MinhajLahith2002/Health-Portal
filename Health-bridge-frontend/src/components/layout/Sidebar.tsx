"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  FileSpreadsheet,
  FlaskConical,
  Pill,
  CreditCard,
  AlertTriangle,
  Bell,
  Sliders,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldAlert,
  TestTube2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { clearAuthData } from "@/lib/auth";

export interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  userRole?: string;
  userName?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "primary" | "outline" | "success" | "danger" | "warning" | "info" | "purple" | "neutral";
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    groupTitle: "Core Modules",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Appointments", href: "/appointments", icon: Calendar, badge: "3 New", badgeVariant: "primary" },
    ],
  },
  {
    groupTitle: "Clinical Services",
    items: [
      { title: "Prescriptions", href: "/prescriptions", icon: FileText },
      { title: "Medical Records", href: "/medical-records", icon: FileSpreadsheet },
      { title: "Laboratory", href: "/laboratory", icon: FlaskConical },
      { title: "Pharmacy", href: "/pharmacy", icon: Pill },
    ],
  },
  {
    groupTitle: "Operations & Admin",
    items: [
      { title: "Payments", href: "/payments", icon: CreditCard },
      { title: "Emergency Response", href: "/emergency", icon: AlertTriangle, badge: "Live", badgeVariant: "danger" },
      { title: "Notifications", href: "/notifications", icon: Bell },
      { title: "Dev20 Test Bench", href: "/dev20-test", icon: TestTube2, badge: "Dev UI", badgeVariant: "purple" },
    ],
  },
  {
    groupTitle: "Patient Services",
    items: [
      { title: "Emergency SOS", href: "/patient/sos", icon: ShieldAlert, badge: "SOS", badgeVariant: "danger" },
    ],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
  userRole = "System Admin",
  userName = "Dr. Anura Jayasinghe",
}) => {
  const pathname = usePathname();

  const sidebarContent = (
    <div
      className={cn(
        "flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 select-none shadow-xl",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm1 14h-2v-3H8v-2h3V7h2v3h3v2h-3v3z" />
            </svg>
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-base text-white tracking-tight leading-none">
                Health<span className="text-blue-400">Bridge</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-1">
                Healthcare Suite
              </span>
            </div>
          )}
        </Link>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Desktop Collapse Toggle */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Navigation Group Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {group.groupTitle}
              </h3>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group relative",
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-105",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />

                  {!collapsed && <span className="truncate flex-1">{item.title}</span>}

                  {!collapsed && item.badge && (
                    <Badge
                      variant={item.badgeVariant || "primary"}
                      size="sm"
                      className="ml-auto text-[10px] px-1.5 py-0.5"
                    >
                      {item.badge}
                    </Badge>
                  )}

                  {/* Tooltip badge for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-800 text-slate-100 text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-slate-700">
                      {item.title}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile & Footer Section */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/50">
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800 transition-all",
            collapsed && "flex-col justify-center p-1.5 gap-2"
          )}
        >
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
              {userName.charAt(0)}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-white truncate">{userName}</span>
              <span className="text-[10px] text-blue-400 font-medium truncate">{userRole}</span>
            </div>
          )}

          <button
            onClick={() => {
              clearAuthData();
              window.location.href = "/login";
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent / Collapsible Sidebar */}
      <aside className="hidden md:block h-screen sticky top-0 z-30 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-out Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer Content */}
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
