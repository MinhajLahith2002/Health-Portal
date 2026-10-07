"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Sidebar from "@/components/ui/Sidebar";
import { MessageCircle } from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  Notification,
} from "@/services/notificationService";

export default function PatientNotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function loadNotifications() {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function handleNotificationClick(
    notification: Notification
  ) {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);

        setNotifications((previous) =>
          previous.map((item) =>
            item.id === notification.id
              ? { ...item, read: true }
              : item
          )
        );
      }

      if (
        notification.referenceType === "SUPPORT_TICKET" &&
        notification.referenceId
      ) {
        router.push(
    `/support/patient?ticketId=${notification.referenceId}`
  );
      }
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        userRole="PATIENT"
      />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-slate-50">
        <Navbar
          title="Patient Notifications"
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
          userRole="PATIENT"
        />
        <main className="flex-1">
          {loading ? (
            <div className="p-6">
              Loading notifications...
            </div>
          ) : (
            <div className="min-h-screen bg-gray-50 p-6">
              <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Updates about your support tickets
          </p>
        </div>

        {/* Notifications */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          {notifications.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mb-3 text-4xl">
                🔔
              </div>

              <h2 className="font-semibold text-gray-700">
                No notifications
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                You don't have any notifications yet.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() =>
                  handleNotificationClick(notification)
                }
                className={`flex w-full gap-4  p-5 text-left transition hover:bg-gray-50 ${
                  !notification.read
                    ? "bg-blue-50"
                    : "bg-white"
                }`}
              >
                {/* Icon */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100">
                 <MessageCircle className="h-5 w-5 text-[#0052CC]" />
               </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-sm ${
                        notification.read
                          ? "font-medium text-gray-700"
                          : "font-bold text-gray-900"
                      }`}
                    >
                      {notification.title}
                    </h3>

                    {!notification.read && (
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    )}
                  </div>

                  <p className="mt-1 text-sm text-gray-600">
                    {notification.message}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}