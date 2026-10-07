"use client";

import { useMemo, useSyncExternalStore } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getStoredUser } from "@/lib/auth";
import styles from "./analytics.module.css";

function subscribeToStoredUser(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getStoredUserSnapshot() {
  return JSON.stringify(getStoredUser());
}

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const storedUserSnapshot = useSyncExternalStore(subscribeToStoredUser, getStoredUserSnapshot, () => "null");
  const user = useMemo(() => JSON.parse(storedUserSnapshot) as ReturnType<typeof getStoredUser>, [storedUserSnapshot]);
  const userRole = user?.role.replaceAll("_", " ") ?? "Authenticated User";

  return <DashboardLayout pageTitle="Analytics & Reporting" userName={user?.fullName ?? "HealthBridge User"} userRole={userRole}><div className={`${styles.analytics} -m-4 md:-m-8`}>{children}</div></DashboardLayout>;
}
