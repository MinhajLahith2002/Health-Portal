"use client";

import {
  useEffect,
  useState,
} from "react";

import DashboardLayout
  from "@/app/dashboard/layout";

import DoctorShell
  from "@/features/doctor/components/DoctorShell";

import {
  getStoredUser,
  type AuthUser,
} from "@/lib/auth";


interface PrescriptionsLayoutProps {
  children: React.ReactNode;
}


export default function PrescriptionsLayout({
  children,
}: PrescriptionsLayoutProps) {

  const [
    user,
    setUser,
  ] =
    useState<
      AuthUser
      | null
      | undefined
    >(
      undefined
    );


  useEffect(
    () => {

      setUser(
        getStoredUser()
      );

    },
    []
  );


  /*
   * Wait until stored user is resolved.
   */
  if (
    user === undefined
  ) {

    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-slate-50
        "
      >
        <div
          className="text-center"
        >
          <div
            className="
              mx-auto
              h-10
              w-10
              animate-spin
              rounded-full
              border-4
              border-slate-200
              border-t-blue-600
            "
          />

          <p
            className="
              mt-3
              text-sm
              text-slate-500
            "
          >
            Loading Prescriptions...
          </p>
        </div>
      </div>
    );
  }


  /*
   * Doctor keeps the existing Doctor workspace.
   *
   * Important:
   * We DO NOT use MedicalRecordsShell here,
   * therefore the Medical Records PDF Report
   * button will not appear in Prescriptions.
   */
  if (
    user?.role === "DOCTOR"
  ) {

    return (
      <DoctorShell>
        {children}
      </DoctorShell>
    );
  }


  /*
   * Patient / Admin / other allowed roles
   * keep the normal shared dashboard.
   */
  return (
    <DashboardLayout
      pageTitle="Prescriptions"
    >
      {children}
    </DashboardLayout>
  );
}