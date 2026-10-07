"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingPage } from "@/components/ui/LoadingPage";
import { WelcomePage } from "@/components/ui/WelcomePage";
import { getRoleRedirectPath, getStoredUser, getToken } from "@/lib/auth";

export default function RootPage() {
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const loadingTimer = window.setTimeout(() => {
      setShowLoading(false);
    }, 1500);

    const token = getToken();
    const user = getStoredUser();

    if (token && user) {
      router.replace(getRoleRedirectPath(user.role));
    }

    return () => window.clearTimeout(loadingTimer);
  }, [router]);

  if (showLoading) {
    return <LoadingPage message="LOADING HEALTH BRIDGE..." />;
  }

  return <WelcomePage />;
}