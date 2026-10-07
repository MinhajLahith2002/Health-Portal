"use client";

import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/axios";

export interface AppNotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get<AppNotificationItem[]>("/notifications");
      setNotifications(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load notifications"));
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );

    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to mark notification as read"));
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => void reload(), 0);
    return () => window.clearTimeout(task);
  }, [reload]);

  return {
    notifications,
    loading,
    error,
    reload,
    markAsRead,
  };
}

export default useNotifications;
