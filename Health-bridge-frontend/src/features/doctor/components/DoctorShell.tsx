"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/ui/Sidebar";
import Navbar from "@/components/ui/Navbar";
import { authService } from "@/services/auth.service";

export default function DoctorShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState<string>("Doctor");

  useEffect(() => {
    const updateName = () => {
      const user = authService.getUser();
      const email = user?.email?.toLowerCase().trim();
      let name = "";

      if (email && typeof window !== "undefined") {
        const override = localStorage.getItem(`healthbridge_user_override_${email}`);
        if (override) {
          try {
            const parsed = JSON.parse(override);
            if (parsed.fullName) name = parsed.fullName;
          } catch {
            // ignore
          }
        }
      }

      const userObj = user as any;
      if (!name && userObj && (userObj.fullName || userObj.name)) {
        name = userObj.fullName || userObj.name;
      }

      if (!name && typeof window !== "undefined") {
        const stored = localStorage.getItem("healthbridge_user");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            name = parsed.fullName || parsed.name || parsed.email?.split("@")[0] || "Doctor";
          } catch {
            // ignore
          }
        }
      }

      if (!name) name = "Doctor";

      setUserName(name.startsWith("Dr.") ? name : `Dr. ${name}`);
    };

    updateName();

    window.addEventListener("user-profile-updated", updateName);
    window.addEventListener("storage", updateName);

    return () => {
      window.removeEventListener("user-profile-updated", updateName);
      window.removeEventListener("storage", updateName);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f4f7f9] text-slate-900">
      <Sidebar userRole="DOCTOR" userName={userName} mobileOpen={open} onCloseMobile={() => setOpen(false)} />
      <div className="min-w-0 flex-1">
        <Navbar
          onToggleMobileSidebar={() => setOpen(true)}
          title="Doctor Dashboard"
          userName={userName}
          userRole="DOCTOR"
          fixed
        />
        <main className="mx-auto max-w-[1440px] p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8 lg:pt-20">{children}</main>
      </div>
    </div>
  );
}
