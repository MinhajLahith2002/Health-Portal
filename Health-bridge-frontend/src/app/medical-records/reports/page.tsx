"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  CalendarDays,
  Download,
  FileDown,
  FileText,
  Loader2,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

import MedicalRecordsShell
  from "@/components/medical-records/MedicalRecordsShell";

import {
  getStoredUser,
  type AuthUser,
} from "@/lib/auth";

import {
  medicalRecordService,
} from "@/services/medicalRecordService";

import {
  medicalRecordPdfService,
} from "@/services/medicalRecordPdfService";

import type {
  PatientLookupResult,
} from "@/types/medicalRecord";


type SupportedRole =
  | "DOCTOR"
  | "PATIENT";


function formatDate(
  value?: string | null
): string {

  if (!value) {
    return "No visits yet";
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return value;
  }


  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    date
  );
}


function getErrorMessage(
  error: unknown
): string {

  if (
    typeof error === "object"
    && error !== null
    && "response" in error
  ) {

    const requestError =
      error as {
        response?: {
          status?: number;
        };
      };


    if (
      requestError.response?.status
      === 403
    ) {

      return (
        "You do not have permission to download "
        + "this patient's medical record PDF."
      );
    }


    if (
      requestError.response?.status
      === 404
    ) {

      return (
        "Patient medical records were not found."
      );
    }
  }


  if (
    error instanceof Error
  ) {

    return error.message;
  }


  return (
    "Unable to download the medical record PDF."
  );
}


export default function MedicalRecordReportsPage() {

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<AuthUser | null>(
      null
    );


  const [
    patients,
    setPatients,
  ] =
    useState<
      PatientLookupResult[]
    >(
      []
    );


  const [
    selectedPatientId,
    setSelectedPatientId,
  ] =
    useState(
      ""
    );


  const [
    loadingPatients,
    setLoadingPatients,
  ] =
    useState(
      false
    );


  const [
    downloading,
    setDownloading,
  ] =
    useState(
      false
    );


  const [
    error,
    setError,
  ] =
    useState(
      ""
    );


  const [
    success,
    setSuccess,
  ] =
    useState(
      ""
    );


  const role =
    currentUser?.role as
      SupportedRole
      | undefined;


  const isDoctor =
    role === "DOCTOR";


  const isPatient =
    role === "PATIENT";


  /*
   * Currently selected patient.
   */
  const selectedPatient =
    useMemo(
      () =>
        patients.find(
          patient =>
            patient.id
            === selectedPatientId
        ) ?? null,
      [
        patients,
        selectedPatientId,
      ]
    );


  /*
   * =========================================================
   * LOAD USER + PATIENT LIST
   * =========================================================
   */
  useEffect(
    () => {

      const storedUser =
        getStoredUser();


      if (!storedUser) {

        setError(
          "Please login to access Medical Record PDF reports."
        );

        return;
      }


      setCurrentUser(
        storedUser
      );


      /*
       * =====================================================
       * PATIENT
       * =====================================================
       *
       * Patient automatically uses own account.
       */
      if (
        storedUser.role
        === "PATIENT"
      ) {

        const ownPatient:
          PatientLookupResult =
          {
            id:
              storedUser.id,

            fullName:
              storedUser.fullName
              || "Patient",
          };


        setPatients(
          [
            ownPatient,
          ]
        );


        setSelectedPatientId(
          storedUser.id
        );


        return;
      }


      /*
       * =====================================================
       * DOCTOR
       * =====================================================
       *
       * Existing getMyPatients endpoint returns only
       * patients for whom this doctor has an active
       * MedicalRecord.
       */
      if (
        storedUser.role
        === "DOCTOR"
      ) {

        setLoadingPatients(
          true
        );


        void medicalRecordService
          .getMyPatients()
          .then(
            response => {

              setPatients(
                response
              );


              if (
                response.length
                > 0
              ) {

                setSelectedPatientId(
                  response[0].id
                );
              }
            }
          )
          .catch(
            () => {

              setError(
                "Unable to load your Medical Record patients."
              );
            }
          )
          .finally(
            () => {

              setLoadingPatients(
                false
              );
            }
          );


        return;
      }


      setError(
        "Medical Record PDF download is available for doctors and patients."
      );
    },
    []
  );


  /*
   * =========================================================
   * DOWNLOAD
   * =========================================================
   */
  const handleDownload =
    async () => {

      if (
        !selectedPatientId
        || downloading
      ) {

        return;
      }


      setDownloading(
        true
      );


      setError(
        ""
      );


      setSuccess(
        ""
      );


      try {

        await medicalRecordPdfService
          .downloadPatientPdf(
            selectedPatientId,
            selectedPatient?.fullName
          );


        setSuccess(
          "Detailed medical record PDF downloaded successfully."
        );


      } catch (
        downloadError
      ) {

        setError(
          getErrorMessage(
            downloadError
          )
        );


      } finally {

        setDownloading(
          false
        );
      }
    };


  return (
    <MedicalRecordsShell
      pageTitle="Medical Record PDF"
    >

      <div
        className="
          mx-auto
          w-full
          max-w-5xl
          space-y-6
        "
      >

        {/* HEADER */}
        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-start
            sm:justify-between
          "
        >

          <div>

            <p
              className={
                isDoctor
                  ? "text-sm font-semibold text-blue-600"
                  : "text-sm font-semibold text-blue-600"
              }
            >
              Medical Records
            </p>


            <h1
              className="
                mt-1
                text-2xl
                font-bold
                text-slate-900
              "
            >
              Detailed PDF Report
            </h1>


            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-slate-500
              "
            >
              Download a complete active EHR report containing
              patient details, doctor and branch details,
              medical records, diagnoses, treatment records,
              consultation notes and clinical document details.
            </p>

          </div>


          <Link
            href="/medical-records"
            className="
              inline-flex
              items-center
              gap-2
              self-start
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-700
              shadow-sm
              transition
              hover:bg-slate-50
            "
          >

            <ArrowLeft
              className="h-4 w-4"
            />

            Back to EHR

          </Link>

        </div>


        {/* DOWNLOAD CARD */}
        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >

          {/* CARD HEADER */}
          <div
            className={
              isDoctor
                ? "border-b border-blue-100 bg-blue-50/70 p-5"
                : "border-b border-blue-100 bg-blue-50/70 p-5"
            }
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className={
                  isDoctor
                    ? "flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white"
                    : "flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white"
                }
              >

                {
                  isDoctor
                    ? (
                      <Stethoscope
                        className="h-5 w-5"
                      />
                    )
                    : (
                      <UserRound
                        className="h-5 w-5"
                      />
                    )
                }

              </div>


              <div>

                <h2
                  className="
                    font-bold
                    text-slate-900
                  "
                >

                  {
                    isDoctor
                      ? "Select Your Patient"
                      : "Your Medical Record"
                  }

                </h2>


                <p
                  className="
                    mt-0.5
                    text-sm
                    text-slate-500
                  "
                >

                  {
                    isDoctor
                      ? "Only patients for whom you created an active Medical Record are listed."
                      : "Patients can download only their own medical record PDF."
                  }

                </p>

              </div>

            </div>

          </div>


          {/* CARD CONTENT */}
          <div
            className="p-5 sm:p-6"
          >

            {/* LOADING */}
            {
              loadingPatients
              && (
                <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    py-12
                    text-sm
                    text-slate-500
                  "
                >

                  <Loader2
                    className="
                      h-5
                      w-5
                      animate-spin
                    "
                  />

                  Loading patients...

                </div>
              )
            }


            {/* NO DOCTOR PATIENTS */}
            {
              !loadingPatients
              && isDoctor
              && patients.length === 0
              && (
                <div
                  className="
                    rounded-xl
                    border
                    border-dashed
                    border-slate-300
                    bg-slate-50
                    p-8
                    text-center
                  "
                >

                  <FileText
                    className="
                      mx-auto
                      h-8
                      w-8
                      text-slate-400
                    "
                  />


                  <p
                    className="
                      mt-3
                      font-semibold
                      text-slate-700
                    "
                  >
                    No Medical Record patients yet
                  </p>


                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-500
                    "
                  >
                    Create a Medical Record for a patient first.
                  </p>

                </div>
              )
            }


            {/* PATIENT AVAILABLE */}
            {
              !loadingPatients
              && patients.length > 0
              && (
                <div
                  className="space-y-5"
                >

                  {/* DOCTOR PATIENT DROPDOWN */}
                  {
                    isDoctor
                    && (
                      <div>

                        <label
                          htmlFor="pdf-patient"
                          className="
                            mb-2
                            block
                            text-sm
                            font-semibold
                            text-slate-700
                          "
                        >
                          Patient
                        </label>


                        <select
                          id="pdf-patient"
                          value={
                            selectedPatientId
                          }
                          onChange={
                            event => {

                              setSelectedPatientId(
                                event.target.value
                              );

                              setError(
                                ""
                              );

                              setSuccess(
                                ""
                              );
                            }
                          }
                          className="
                            w-full
                            rounded-xl
                            border
                            border-slate-300
                            bg-white
                            px-3
                            py-3
                            text-sm
                            text-slate-800
                            outline-none
                            transition
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-100
                          "
                        >

                          {
                            patients.map(
                              patient => (

                                <option
                                  key={
                                    patient.id
                                  }
                                  value={
                                    patient.id
                                  }
                                >

                                  {
                                    patient.fullName
                                  }

                                  {
                                    typeof patient.recordCount
                                    === "number"
                                      ? ` (${patient.recordCount} record${
                                          patient.recordCount === 1
                                            ? ""
                                            : "s"
                                        })`
                                      : ""
                                  }

                                </option>

                              )
                            )
                          }

                        </select>

                      </div>
                    )
                  }


                  {/* SELECTED PATIENT INFO */}
                  {
                    selectedPatient
                    && (
                      <div
                        className="
                          grid
                          gap-4
                          rounded-2xl
                          border
                          border-slate-200
                          bg-slate-50
                          p-4
                          sm:grid-cols-3
                        "
                      >

                        {/* NAME */}
                        <div
                          className="
                            flex
                            items-start
                            gap-3
                          "
                        >

                          <UserRound
                            className="
                              mt-0.5
                              h-5
                              w-5
                              text-slate-500
                            "
                          />


                          <div>

                            <p
                              className="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wide
                                text-slate-500
                              "
                            >
                              Patient
                            </p>


                            <p
                              className="
                                mt-1
                                font-semibold
                                text-slate-900
                              "
                            >
                              {
                                selectedPatient.fullName
                              }
                            </p>

                          </div>

                        </div>


                        {/* RECORD COUNT */}
                        <div
                          className="
                            flex
                            items-start
                            gap-3
                          "
                        >

                          <FileText
                            className="
                              mt-0.5
                              h-5
                              w-5
                              text-slate-500
                            "
                          />


                          <div>

                            <p
                              className="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wide
                                text-slate-500
                              "
                            >
                              Records Created
                            </p>


                            <p
                              className="
                                mt-1
                                font-semibold
                                text-slate-900
                              "
                            >

                              {
                                typeof selectedPatient.recordCount
                                === "number"
                                  ? selectedPatient.recordCount
                                  : isPatient
                                    ? "Own EHR"
                                    : "Available"
                              }

                            </p>

                          </div>

                        </div>


                        {/* LAST VISIT */}
                        <div
                          className="
                            flex
                            items-start
                            gap-3
                          "
                        >

                          <CalendarDays
                            className="
                              mt-0.5
                              h-5
                              w-5
                              text-slate-500
                            "
                          />


                          <div>

                            <p
                              className="
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wide
                                text-slate-500
                              "
                            >
                              Last Visit
                            </p>


                            <p
                              className="
                                mt-1
                                font-semibold
                                text-slate-900
                              "
                            >

                              {
                                isPatient
                                  ? "Included in report"
                                  : formatDate(
                                      selectedPatient
                                        .lastVisitDate
                                    )
                              }

                            </p>

                          </div>

                        </div>

                      </div>
                    )
                  }


                  {/* SECURITY */}
                  <div
                    className="
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      p-4
                    "
                  >

                    <div
                      className="
                        flex
                        gap-3
                      "
                    >

                      <ShieldCheck
                        className={
                          isDoctor
                            ? "mt-0.5 h-5 w-5 shrink-0 text-blue-600"
                            : "mt-0.5 h-5 w-5 shrink-0 text-blue-600"
                        }
                      />


                      <div>

                        <p
                          className="
                            text-sm
                            font-semibold
                            text-slate-800
                          "
                        >
                          Secure role-based download
                        </p>


                        <p
                          className="
                            mt-1
                            text-xs
                            leading-5
                            text-slate-500
                          "
                        >

                          The backend validates the logged-in user
                          before generating the PDF.

                          A patient cannot download another
                          patient's report.

                          A doctor can download reports only for
                          patients in the doctor's own Medical
                          Record patient list.

                        </p>

                      </div>

                    </div>

                  </div>


                  {/* ERROR */}
                  {
                    error
                    && (
                      <div
                        className="
                          rounded-xl
                          border
                          border-rose-200
                          bg-rose-50
                          px-4
                          py-3
                          text-sm
                          text-rose-700
                        "
                      >
                        {error}
                      </div>
                    )
                  }


                  {/* SUCCESS */}
                  {
                    success
                    && (
                      <div
                        className="
                          rounded-xl
                          border
                          border-emerald-200
                          bg-emerald-50
                          px-4
                          py-3
                          text-sm
                          text-emerald-700
                        "
                      >
                        {success}
                      </div>
                    )
                  }


                  {/* DOWNLOAD BUTTON */}
                  <button
                    type="button"
                    onClick={
                      handleDownload
                    }
                    disabled={
                      downloading
                      || !selectedPatientId
                    }
                    className={
                      isDoctor
                        ? `
                          inline-flex
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-blue-600
                          px-5
                          py-3
                          text-sm
                          font-semibold
                          text-white
                          shadow-sm
                          transition
                          hover:bg-blue-700
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        `
                        : `
                          inline-flex
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-blue-600
                          px-5
                          py-3
                          text-sm
                          font-semibold
                          text-white
                          shadow-sm
                          transition
                          hover:bg-blue-700
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        `
                    }
                  >

                    {
                      downloading
                        ? (
                          <>
                            <Loader2
                              className="
                                h-4
                                w-4
                                animate-spin
                              "
                            />

                            Generating PDF...
                          </>
                        )
                        : (
                          <>
                            <Download
                              className="h-4 w-4"
                            />

                            Download Detailed Medical Record PDF
                          </>
                        )
                    }

                  </button>

                </div>
              )
            }

          </div>

        </section>


        {/* INFORMATION CARDS */}
        <section
          className="
            grid
            gap-4
            md:grid-cols-3
          "
        >

          <InfoCard
            icon={
              <UserRound
                className="h-5 w-5"
              />
            }
            title="Patient details"
            text="Profile identity, contact, date of birth, blood group and registered branch when available."
          />


          <InfoCard
            icon={
              <Stethoscope
                className="h-5 w-5"
              />
            }
            title="Doctor & branch"
            text="Each record includes its doctor information and the doctor's current HealthBridge branch when available."
          />


          <InfoCard
            icon={
              <FileDown
                className="h-5 w-5"
              />
            }
            title="Full EHR detail"
            text="Medical records, clinical notes, symptoms, treatment plans, diagnoses, treatments and document metadata."
          />

        </section>

      </div>

    </MedicalRecordsShell>
  );
}


function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        shadow-sm
      "
    >

      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          bg-slate-100
          text-slate-600
        "
      >
        {icon}
      </div>


      <h3
        className="
          mt-3
          font-semibold
          text-slate-900
        "
      >
        {title}
      </h3>


      <p
        className="
          mt-1
          text-sm
          leading-6
          text-slate-500
        "
      >
        {text}
      </p>

    </div>
  );
}