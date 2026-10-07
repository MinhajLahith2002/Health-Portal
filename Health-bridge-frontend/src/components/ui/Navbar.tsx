"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  AlertTriangle,
  User,
  ShieldCheck,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearAuthData } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";

import {
  getNotifications,
  markNotificationAsRead,
  Notification,
} from "@/services/notificationService";

export interface NavbarProps {
  onToggleMobileSidebar?: () => void;
  title?: string;
  userName?: string;
  userRole?: string;
  fixed?: boolean;
}

// ============================================================
// ROLE NAVIGATION CONFIG
// ============================================================

const normalizeRole = (role: string): string =>
  role.trim().toUpperCase().replace(/[\s-]+/g, "_");

interface RoleRoutes {
  notificationsAll: string;
  supportTicket: string;
}

const ROLE_ROUTES: Record<string, RoleRoutes> = {
  PATIENT: {
    notificationsAll: "/notifications/patient",
    supportTicket: "/support/patient",
  },
  ADMIN: {
    notificationsAll: "/notifications/admin",
    supportTicket: "/support/admin",
  },
  SUPER_ADMIN: {
    notificationsAll: "/notifications/admin",
    supportTicket: "/support/admin",
  },
  DOCTOR: {
    notificationsAll: "/notifications/doctor",
    supportTicket: "/support/doctor",
  },
  PHARMACIST: {
    notificationsAll: "/notifications/pharmacist",
    supportTicket: "/support/pharmacist",
  },
  INSURANCE_OFFICER: {
    notificationsAll: "/notifications/insurance-officer",
    supportTicket: "/support/insurance-officer",
  },
  LAB_OFFICER: {
    notificationsAll: "/notifications/lab-officer",
    supportTicket: "/support/lab-officer",
  },
};

const getRoleRoutes = (role: string): RoleRoutes =>
  ROLE_ROUTES[normalizeRole(role)] ?? ROLE_ROUTES.PATIENT;

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  title = "Dashboard",
  userName = "User",
  userRole = "Patient",
  fixed = false,
}) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // ============================================================
  // LOAD NOTIFICATIONS
  // ============================================================

  const loadNotifications = useCallback(async () => {
    if (!localStorage.getItem("healthbridge_token")) {
      setNotifications([]);
      setUnreadNotifications(0);
      return;
    }

    try {
      const data = await getNotifications();
      setNotifications(data);

      const unreadCount = data.filter((notification) => !notification.read).length;
      setUnreadNotifications(unreadCount);
    } catch {
      setNotifications([]);
      setUnreadNotifications(0);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadNotifications(), 0);

    const refreshWhileVisible = () => {
      if (document.visibilityState === "visible") {
        void loadNotifications();
      }
    };
    const interval = window.setInterval(refreshWhileVisible, 15000);

    window.addEventListener("focus", refreshWhileVisible);
    document.addEventListener("visibilitychange", refreshWhileVisible);

    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshWhileVisible);
      document.removeEventListener("visibilitychange", refreshWhileVisible);
    };
  }, [loadNotifications]);

  // ============================================================
  // HANDLE NOTIFICATION CLICK
  // ============================================================

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);

        setNotifications((previousNotifications) =>
          previousNotifications.map((item) =>
            item.id === notification.id ? { ...item, read: true } : item
          )
        );

        setUnreadNotifications((count) => Math.max(0, count - 1));
      }

      setShowNotifications(false);
      const routes = getRoleRoutes(userRole);

      if (notification.referenceType === "SUPPORT_TICKET") {
        router.push(routes.supportTicket);
        return;
      }

      router.push(routes.notificationsAll);
    } catch (error) {
      console.error("Failed to process notification:", error);
    }
  };

  // ============================================================
  // MARK ALL AS READ
  // ============================================================

  const handleMarkAllRead = async () => {
    try {
      const unread = notifications.filter((notification) => !notification.read);

      await Promise.all(
        unread.map((notification) => markNotificationAsRead(notification.id))
      );

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadNotifications(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // ============================================================
  // LOGOUT & NAVIGATION
  // ============================================================

  const handleLogout = () => {
    clearAuthData();
    window.location.href = "/login";
  };

  const handleEmergency = () => {
    router.push(userRole.toUpperCase() === "DOCTOR" ? "/emergency" : "/patient/sos");
  };

  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    router.push(getRoleRoutes(userRole).notificationsAll);
  };

  const formatNotificationTime = (createdAt: string | undefined) => {
    if (!createdAt) return "";
    try {
      const date = new Date(createdAt);
      if (Number.isNaN(date.getTime())) return createdAt;
      return date.toLocaleString();
    } catch {
      return createdAt;
    }
  };

  return (
    <header className={cn(
      "h-16 border-b border-slate-100 bg-white/90 backdrop-blur-md z-40 px-4 md:px-6 flex items-center justify-between gap-4 transition-colors",
      fixed ? "fixed top-0 left-0 right-0 lg:left-64" : "sticky top-0"
    )}>
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none md:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-[#0A2540] tracking-tight leading-snug">
            {title}
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>System Active</span>
            <span>•</span>
            <span>Hospital Node #01</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* EMERGENCY */}
        <button onClick={handleEmergency} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-semibold transition-all shadow-sm">
          <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
          <span>Emergency</span>
        </button>

        {/* NOTIFICATIONS */}
        <div className="relative">
          <button
            onClick={() => {
              const opening = !showNotifications;
              setShowNotifications(opening);
              if (opening) void loadNotifications();
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC]">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#0A2540]">
                    Notifications
                  </h3>
                  {unreadNotifications > 0 && (
                    <Badge variant="primary" size="sm">
                      {unreadNotifications} Unread
                    </Badge>
                  )}
                </div>
                {unreadNotifications > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-medium text-blue-600 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-medium text-slate-500">
                      No notifications
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      You&apos;re all caught up.
                    </p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "w-full text-left p-3.5 transition-colors flex gap-3",
                        notification.read
                          ? "bg-white hover:bg-slate-50"
                          : "bg-blue-50/30 hover:bg-blue-50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mt-1.5 shrink-0",
                          notification.read ? "bg-slate-300" : "bg-blue-500"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#0A2540]">
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {notification.message}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {formatNotificationTime(notification.createdAt)}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 text-center bg-[#F8FAFC]">
                <button
                  onClick={handleViewAllNotifications}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-[#0A2540] leading-tight">
                {userName}
              </span>
              <span className="text-[10px] text-blue-600 font-medium">
                {userRole}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 p-1.5">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-[#0A2540]">{userName}</p>
                <p className="text-[11px] text-slate-500">{userRole}</p>
              </div>

              {/* Profile Link */}
              <a
                href={normalizeRole(userRole) === "DOCTOR" ? "/doctor/profile" : "/profile"}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile & Account
              </a>

              {/* Settings Link */}
              <a
                href="/profile/settings"
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                Settings
              </a>

              <div className="my-1 border-t border-slate-100" />

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
