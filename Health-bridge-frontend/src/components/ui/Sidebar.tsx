"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  FileSpreadsheet,
  FlaskConical,
  Pill,
  CreditCard,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  TestTube2,
  X,
  ShieldAlert,
  Settings,
  TrendingUp,
  DollarSign,
  ClipboardCheck,
  Video,
  LifeBuoy,
  Building2,
  Bed,
  Wrench,
  UserCog,
  ClipboardList,
  Plus,
  AlertTriangle,
  CalendarClock,
  Truck,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearAuthData, getRoleRedirectPath } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";

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

const getNavGroups = (role: string): NavGroup[] => {
  const roleUpper = role?.toUpperCase() || "PATIENT";

  function roleLower(r: string): string {
    return r?.toLowerCase() || "patient";
  }

  // Admin
  if (roleUpper === "ADMIN") {
    return [
      {
        groupTitle: "Overview",
        items: [
          { title: "Dashboard", href: `/${roleLower(role)}/dashboard`, icon: LayoutDashboard },
          { title: "Analytics", href: "/analytics", icon: TrendingUp },
        ],
      },
      {
        groupTitle: "Hospital Management",
        items: [
          { title: "Billing", href: "/hospital/billing", icon: DollarSign },
          { title: "Inventory", href: "/hospital/inventory", icon: Pill },
          // ✅ FIXED: Compliance moved outside billing
          { title: "Compliance", href: "/hospital/compliance", icon: ClipboardCheck },
          { title: "Laboratory", href: "/laboratory/dashboard", icon: FlaskConical },
          { title: "Branch Management", href: "/hospital-admin/branch-management", icon: Landmark },
          { title: "Department Management", href: "/hospital-admin/department-management", icon: Building2 },
          { title: "Bed Management", href: "/hospital-admin/bed-management", icon: Bed },
          { title: "Equipment Management", href: "/hospital-admin/equipment-management", icon: Wrench },
        ],
      },
      {
        groupTitle: "Clinical Records",
        items: [
          { title: "Medical Records", href: "/medical-records", icon: FileSpreadsheet },
        ],
      },
      {
        groupTitle: "System Admin",
        items: [
          { title: "Users", href: "/admin/users", icon: Users },
          { title: "Settings", href: "/admin/settings", icon: Settings },

        ],
      },
    ];
  }

  // Super Admin
  if (roleUpper === "SUPER_ADMIN") {
    return [
      {
        groupTitle: "Super Admin",
        items: [
          { title: "Super Admin Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
          { title: "System Analytics", href: "/super-admin/analytics", icon: TrendingUp },
          { title: "Audit Logs", href: "/super-admin/audit-logs", icon: ClipboardCheck },
          { title: "User Management", href: "/super-admin/users", icon: Users },
          { title: "Staff Management", href: "/super-admin/staff", icon: Users },
          { title: "Roles & Permissions", href: "/super-admin/roles", icon: ShieldAlert },
          { title: "Hospital Management", href: "/super-admin/hospitals", icon: Building2 },
          { title: "Doctor Management", href: "/super-admin/doctors", icon: User },
          { title: "Pharmacy Management", href: "/super-admin/pharmacy", icon: Pill },
          { title: "Laboratory Management", href: "/super-admin/laboratories", icon: FlaskConical },
          { title: "Insurance Management", href: "/super-admin/insurance", icon: ShieldAlert },
          { title: "Settings", href: "/super-admin/settings", icon: Settings },
        ],
      },
    ];
  }

  // Super Admin
  if (roleUpper === "SUPER_ADMIN") {
    return [
      {
        groupTitle: "Super Admin",
        items: [
          { title: "Super Admin Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
          { title: "System Analytics", href: "/super-admin/analytics", icon: TrendingUp },
          { title: "Audit Logs", href: "/super-admin/audit-logs", icon: ClipboardCheck },
          { title: "User Management", href: "/super-admin/users", icon: Users },
          { title: "Staff Management", href: "/super-admin/staff", icon: Users },
          { title: "Roles & Permissions", href: "/super-admin/roles", icon: ShieldAlert },
          { title: "Hospital Management", href: "/super-admin/hospitals", icon: Building2 },
          { title: "Doctor Management", href: "/super-admin/doctors", icon: User },
          { title: "Pharmacy Management", href: "/super-admin/pharmacy", icon: Pill },
          { title: "Laboratory Management", href: "/super-admin/laboratories", icon: FlaskConical },
          { title: "Insurance Management", href: "/super-admin/insurance", icon: ShieldAlert },
          { title: "Settings", href: "/super-admin/settings", icon: Settings },
        ],
      },
    ];
  }

  // Doctor
  if (roleUpper === "DOCTOR") {
    return [
      {
        groupTitle: "Clinical",
        items: [
          { title: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
          { title: "Doctor directory", href: "/doctor/doctors", icon: Users },
          { title: "Medical Records", href: "/medical-records", icon: FileSpreadsheet },
          { title: "Schedule", href: "/doctor/schedule", icon: Calendar },
          { title: "Appointments", href: "/doctor/appointments", icon: Calendar },
          { title: "Telemedicine", href: "/telemedicine/history", icon: Video },
          { title: "Leave", href: "/doctor/leave", icon: ClipboardCheck },
          { title: "Earnings", href: "/doctor/earnings", icon: DollarSign },
          { title: "Prescription", href: "/prescriptions", icon: FileText },
        ],
      },
    ];
  }

  // Patient
  if (roleUpper === "PATIENT") {
    return [
      {
        groupTitle: "My Health",
        items: [
          { title: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
          { title: "Family Members", href: "/patient/family", icon: Users },
          { title: "Health Metrics", href: "/patient/health-metrics", icon: TrendingUp },
          { title: "Appointments", href: "/appointments", icon: Calendar },
          { title: "Telemedicine", href: "/telemedicine/history", icon: Video },
          { title: "Prescriptions", href: "/prescriptions", icon: FileText },
          { title: "Medical Records", href: "/medical-records", icon: FileSpreadsheet },
          { title: "Lab Reports", href: "/patient/lab-reports", icon: TestTube2 },
          { title: "Insurance", href: "/patient/insurance", icon: ShieldAlert },
          { title: "Payments", href: "/payments", icon: CreditCard },
          { title: "Reminders", href: "/patient/reminders", icon: Bell },
          { title: "Emergency SOS", href: "/patient/sos", icon: ShieldAlert, badge: "SOS", badgeVariant: "danger" },
          { title: "Support", href: "/support/patient/sdefault", icon: LifeBuoy },
        ],
      },
    ];
  }


  // Pharmacist
  if (roleUpper === "PHARMACIST") {
    return [
      {
        groupTitle: "Pharmacy",
        items: [
          { title: "Pharmacy Dashboard", href: "/pharmacy/dashboard", icon: LayoutDashboard },
          { title: "Prescription", href: "/pharmacy/prescriptions", icon: FileText },
          { title: "Order Management", href: "/pharmacy/orders", icon: ClipboardList },
          { title: "Medicine Inventory", href: "/pharmacy/inventory", icon: Pill },
          { title: "Add/ Edit Medicine", href: "/pharmacy/medicines/new", icon: Plus },
          { title: "Low Stock Alerts", href: "/pharmacy/inventory/low-stock", icon: AlertTriangle },
          { title: "Expiry Management", href: "/pharmacy/inventory/expiry", icon: CalendarClock },
          { title: "Deliveries", href: "/pharmacy/deliveries", icon: Truck },
          { title: "Reports", href: "/pharmacy/reports", icon: FileSpreadsheet },
        ],
      },
    ];
  }

  // Lab Officer
  if (roleUpper === "LAB_OFFICER") {
    return [
      {
        groupTitle: "Laboratory",
        items: [
          { title: "Dashboard", href: "/laboratory/dashboard", icon: LayoutDashboard },
          { title: "Test Orders", href: "/laboratory/test-orders", icon: ClipboardCheck },
          { title: "Samples", href: "/laboratory/samples", icon: TestTube2 },
          { title: "Processing", href: "/laboratory/processing", icon: FlaskConical },
          { title: "Results", href: "/laboratory/results", icon: FileText },
          { title: "Reports", href: "/laboratory/reports", icon: FileSpreadsheet },
        ],
      },
    ];
  }

  // Insurance Officer
  if (roleUpper === "INSURANCE_OFFICER") {
    return [
      {
        groupTitle: "Insurance Operations",
        items: [
          { title: "Dashboard", href: "/insurance-officer/dashboard", icon: LayoutDashboard },
          { title: "Claims", href: "/insurance-officer/claims", icon: FileText },
          { title: "Policies", href: "/insurance-officer/policies", icon: ShieldAlert },
          { title: "Fraud Detection", href: "/fraud-detection", icon: ShieldAlert },
          { title: "Reports", href: "/insurance-officer/reports", icon: FileSpreadsheet },
        ],
      },
    ];
  }

  // Default
  return [
    {
      groupTitle: "Core Modules",
      items: [
        { title: "Dashboard", href: `/${roleLower(role)}/dashboard`, icon: LayoutDashboard },
        { title: "Appointments", href: "/appointments", icon: Calendar },
      ],
    },
  ];
};

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
  userRole = "PATIENT",
  userName = "User",
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const navGroups = getNavGroups(userRole);

  const sidebarContent = (
    <div
      className={cn(
        "flex flex-col h-full bg-white text-slate-700 border-r border-slate-200 transition-all duration-300 select-none shadow-xl",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
        <Link href={getRoleRedirectPath(userRole)} className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm1 14h-2v-3H8v-2h3V7h2v3h3v2h-3v3z" />
            </svg>
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-base text-[#0A2540] tracking-tight leading-none">
                Health<span className="text-blue-600">Bridge</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-1">
                Healthcare Suite
              </span>
            </div>
          )}
        </Link>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {group.groupTitle}
              </h3>
            )}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href + "/"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group relative",
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30"
                      : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-105",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"
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

                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#0A2540] text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-slate-700">
                      {item.title}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-slate-100 bg-[#F8FAFC]">
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200 transition-all",
            collapsed && "flex-col justify-center p-1.5 gap-2"
          )}
        >
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-sm shadow-md">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-[#0A2540] truncate">{userName}</span>
              <span className="text-[10px] text-blue-600 font-medium truncate">{userRole}</span>
            </div>
          )}

          <button
            onClick={() => {
              clearAuthData();
              window.location.href = "/login";
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
      <aside className="hidden md:block h-screen sticky top-0 z-30 shrink-0">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
