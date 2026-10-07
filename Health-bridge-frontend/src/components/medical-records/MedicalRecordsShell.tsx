"use client";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import {
  FileDown,
  FolderOpen,
} from "lucide-react";

import DashboardLayout
  from "@/app/dashboard/layout";

import DoctorShell
  from "@/features/doctor/components/DoctorShell";

import {
  getStoredUser,
  type AuthUser,
} from "@/lib/auth";


interface MedicalRecordsShellProps {

  children:
    React.ReactNode;

  pageTitle?:
    string;
}


export default function MedicalRecordsShell({
  children,
  pageTitle = "Medical Records",
}: MedicalRecordsShellProps) {

  const pathname =
    usePathname();


  /*
   * undefined = user not checked yet
   * null      = no stored user
   */
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
   * Prevent layout flash before role loads.
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
              border-t-teal-600
            "
          />


          <p
            className="
              mt-3
              text-sm
              text-slate-500
            "
          >
            Loading Medical Records...
          </p>

        </div>

      </div>
    );
  }


  /*
   * PDF feature is available only for:
   *
   * DOCTOR
   * PATIENT
   */
  const canUsePdfReports =
    user?.role === "DOCTOR"
    || user?.role === "PATIENT";


  /*
   * Detect PDF page.
   */
  const isPdfReportPage =
    pathname
    === "/medical-records/reports";


  /*
   * Shared Medical Records content.
   */
  const content = (
    <>

      {
        canUsePdfReports
        && (
          <div
            className="
              mb-4
              flex
              justify-end
            "
          >

            <Link
              href={
                isPdfReportPage
                  ? "/medical-records"
                  : "/medical-records/reports"
              }
              className={
                user?.role === "DOCTOR"
                  ? `
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-blue-200
                    bg-blue-50
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-blue-700
                    shadow-sm
                    transition
                    hover:bg-blue-100
                  `
                  : `
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-blue-200
                    bg-blue-50
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-blue-700
                    shadow-sm
                    transition
                    hover:bg-blue-100
                  `
              }
            >

              {
                isPdfReportPage
                  ? (
                    <>
                      <FolderOpen
                        className="h-4 w-4"
                      />

                      Electronic Health Record
                    </>
                  )
                  : (
                    <>
                      <FileDown
                        className="h-4 w-4"
                      />

                      PDF Report
                    </>
                  )
              }

            </Link>

          </div>
        )
      }


      {children}

    </>
  );


  /*
   * =========================================================
   * DOCTOR
   * =========================================================
   *
   * Keep existing Doctor workspace.
   */
  if (
    user?.role === "DOCTOR"
  ) {

    return (
      <DoctorShell>

        {content}

      </DoctorShell>
    );
  }


  /*
   * =========================================================
   * PATIENT
   * =========================================================
   *
   * Keep existing shared Dashboard layout.
   */
  return (
    <DashboardLayout
      pageTitle={
        pageTitle
      }
    >

      {content}

    </DashboardLayout>
  );
}