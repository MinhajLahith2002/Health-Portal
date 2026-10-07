"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Menu,
  Bell,
  AlertTriangle,
  User,
  ShieldCheck,
  ChevronDown,
  Moon,
  Sun,
  Settings,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { getNotifications } from "@/services/notificationService";
import { clearAuthData } from "@/lib/auth";

export interface NavbarProps {
  onToggleMobileSidebar?: () => void;
  title?: string;
  userName?: string;
  userRole?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  title = "Dashboard",
  userName = "Dr. Anura Jayasinghe",
  userRole = "Chief Medical Officer",
}) => {
  const { info, warning } = useToast();
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  useEffect(() => {
    getNotifications()
      .then((items) => setUnreadNotifications(items.filter((item) => !item.read).length))
      .catch(() => undefined);
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between gap-4 transition-colors">
      {/* Left side: Hamburger Toggle & Page Title */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none md:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
            {title}
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>System Active</span>
            <span>•</span>
            <span>Hospital Node #01</span>
          </div>
        </div>
      </div>

      {/* Right side: Emergency Trigger, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Emergency Response Alert Button */}
        <button
          onClick={() => warning("Emergency Alert", "Emergency Protocol Triggered. Alerting On-Call Staff.")}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/50 text-xs font-semibold transition-all shadow-sm"
        >
          <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
          <span>Emergency</span>
        </button>

        {/* Notifications Dropdown Toggle */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h3>
                  <Badge variant="primary" size="sm">{unreadNotifications} Unread</Badge>
                </div>
                <button
                  onClick={() => setUnreadNotifications(0)}
                  className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                <Link href="/notifications" className="block p-4 text-center text-xs font-medium text-blue-600 hover:bg-slate-50 dark:text-blue-400 dark:hover:bg-slate-800/50">
                  Open notification center
                </Link>
              </div>

              <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-800/50">
                <Link href="/notifications" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
              AJ
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {userName}
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                {userRole}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Flyout */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-1.5">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{userName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{userRole}</p>
              </div>

              <a
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile & Account
              </a>
              <a
                href="/dev20-test"
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                System Integration
              </a>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  clearAuthData();
                  window.location.href = "/login";
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
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