"use client";

import Link from "next/link";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  FilePlus2,
  FileText,
  FolderOpen,
  Loader2,
  Search,
  Stethoscope,
} from "lucide-react";

import DashboardLayout from "@/components/medical-records/MedicalRecordsShell";

import {
  getStoredUser,
  type AuthUser,
} from "@/lib/auth";

import {
  medicalRecordService,
} from "@/services/medicalRecordService";

import type {
  Diagnosis,
  MedicalRecord,
  PatientEhrHistory,
  TreatmentRecord,
} from "@/types/medicalRecord";


type HistoryFilter =
  | "all"
  | "visits"
  | "diagnoses"
  | "treatments";


function formatDate(
  value?: string | null
): string {
  if (!value) {
    return "N/A";
  }

  const date =
    new Date(value);

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
  ).format(date);
}


function getRequestErrorMessage(
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
          data?: {
            message?: string;
          };
        };
      };

    if (
      requestError.response?.status
      === 403
    ) {
      return (
        "You do not have permission "
        + "to access this patient history."
      );
    }

    if (
      requestError.response?.status
      === 404
    ) {
      return (
        "Patient medical history was not found."
      );
    }

    if (
      requestError
        .response
        ?.data
        ?.message
    ) {
      return requestError
        .response
        .data
        .message;
    }
  }

  return "Unable to load patient medical history.";
}


export default function MedicalHistoryPage() {
  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<AuthUser | null>(
      null
    );

  const [
    patientIdInput,
    setPatientIdInput,
  ] =
    useState("");

  const [
    activePatientId,
    setActivePatientId,
  ] =
    useState("");

  const [
    history,
    setHistory,
  ] =
    useState<PatientEhrHistory | null>(
      null
    );

  const [
    filter,
    setFilter,
  ] =
    useState<HistoryFilter>(
      "all"
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");


  /*
   * =========================================================
   * ROLE HELPERS
   * =========================================================
   */
  const canSearchPatients =
    currentUser?.role === "DOCTOR"
    || currentUser?.role === "ADMIN"
    || currentUser?.role === "SUPER_ADMIN";


  const isDoctor =
    currentUser?.role
    === "DOCTOR";


  /*
   * =========================================================
   * LOAD HISTORY
   * =========================================================
   */
  const loadHistory =
    async (
      patientId: string
    ) => {
      const normalizedId =
        patientId.trim();

      if (!normalizedId) {
        setError(
          "Patient ID is required."
        );

        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await medicalRecordService
            .getPatientEhrHistory(
              normalizedId
            );

        setHistory(
          response
        );

        setActivePatientId(
          normalizedId
        );
      } catch (
        requestError
      ) {
        setHistory(
          null
        );

        setError(
          getRequestErrorMessage(
            requestError
          )
        );
      } finally {
        setLoading(false);
      }
    };


  /*
   * =========================================================
   * INITIAL USER + QUERY PARAM
   * =========================================================
   */
  useEffect(
    () => {
      const storedUser =
        getStoredUser();

      if (!storedUser) {
        setError(
          "Please login to access Medical History."
        );

        return;
      }

      setCurrentUser(
        storedUser
      );


      /*
       * Patient:
       * Automatically load own history.
       */
      if (
        storedUser.role
        === "PATIENT"
      ) {
        setPatientIdInput(
          storedUser.id
        );

        void loadHistory(
          storedUser.id
        );

        return;
      }


      /*
       * Doctor/Admin:
       * Support ?patientId=
       */
      const params =
        new URLSearchParams(
          window.location.search
        );

      const queryPatientId =
        params
          .get("patientId")
          ?.trim();

      if (
        queryPatientId
      ) {
        setPatientIdInput(
          queryPatientId
        );

        void loadHistory(
          queryPatientId
        );
      }
    },
    []
  );


  /*
   * =========================================================
   * SORTED RECORDS
   * =========================================================
   */
  const medicalRecords =
    useMemo(
      () => {
        if (!history) {
          return [];
        }

        return [
          ...history.medicalRecords,
        ].sort(
          (
            first,
            second
          ) =>
            new Date(
              second.visitDate
            ).getTime()
            -
            new Date(
              first.visitDate
            ).getTime()
        );
      },
      [
        history,
      ]
    );


  /*
   * =========================================================
   * LATEST VISIT
   * =========================================================
   */
  const latestVisit =
    medicalRecords.length > 0
      ? medicalRecords[0]
      : null;


  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */
  const handleSearch =
    (
      event:
      FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      void loadHistory(
        patientIdInput
      );
    };


  /*
   * =========================================================
   * CHILD HELPERS
   * =========================================================
   */
  const getDiagnosesForRecord =
    (
      medicalRecordId: string
    ): Diagnosis[] => {
      if (!history) {
        return [];
      }

      return history.diagnoses.filter(
        (
          diagnosis
        ) =>
          diagnosis.medicalRecordId
          === medicalRecordId
      );
    };


  const getTreatmentsForRecord =
    (
      medicalRecordId: string
    ): TreatmentRecord[] => {
      if (!history) {
        return [];
      }

      return history.treatments.filter(
        (
          treatment
        ) =>
          treatment.medicalRecordId
          === medicalRecordId
      );
    };


  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */
  const ehrHref =
    activePatientId
      ? (
        `/medical-records?patientId=${
          encodeURIComponent(
            activePatientId
          )
        }`
      )
      : "/medical-records";


  const documentsHref =
    activePatientId
      ? (
        `/medical-records/documents?patientId=${
          encodeURIComponent(
            activePatientId
          )
        }`
      )
      : "/medical-records/documents";


  const createHref =
    activePatientId
      ? (
        `/medical-records/create?patientId=${
          encodeURIComponent(
            activePatientId
          )
        }`
      )
      : "/medical-records/create";


  return (
    <DashboardLayout
      pageTitle="Patient Medical History"
    >
      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          space-y-5
        "
      >
        {/* ==============================================
            HEADER
            ============================================== */}
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
            <Link
              href={
                ehrHref
              }
              className={
              isDoctor
                ? `
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-blue-600
                transition
                hover:text-blue-700
              `
                : `
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-blue-600
                transition
                hover:text-blue-700
              `
            }
            >
              <ArrowLeft
                className="
                  h-4
                  w-4
                "
              />

              Back to EHR
            </Link>


            <h1
              className="
                mt-3
                text-2xl
                font-bold
                text-slate-900
              "
            >
              Patient Health History
            </h1>


            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Complete chronological view
              of visits, diagnoses and treatments.
            </p>
          </div>


          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            {isDoctor && (
              <Link
                href={
                  createHref
                }
                className={
              isDoctor
                ? `
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-blue-700
                `
                : `
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-blue-700
                `
            }
              >
                <FilePlus2
                  className="
                    h-4
                    w-4
                  "
                />

                New Medical Record
              </Link>
            )}


            {activePatientId && (
              <Link
                href={
                  documentsHref
                }
                className={
              isDoctor
                ? `
                  inline-flex
                  items-center
                  justify-center
                  gap-2
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
                  hover:border-blue-300
                  hover:text-blue-600
                `
                : `
                  inline-flex
                  items-center
                  justify-center
                  gap-2
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
                  hover:border-blue-300
                  hover:text-blue-600
                `
            }
              >
                <FolderOpen
                  className="
                    h-4
                    w-4
                  "
                />

                Documents
              </Link>
            )}
          </div>
        </div>


        {/* ==============================================
            PATIENT SEARCH
            ============================================== */}
        {canSearchPatients && (
          <form
            onSubmit={
              handleSearch
            }
            className={
              isDoctor
                ? `
              rounded-2xl
              border
              border-blue-100
              bg-blue-50/70
              p-4
            `
                : `
              rounded-2xl
              border
              border-blue-100
              bg-blue-50/70
              p-4
            `
            }
          >
            <label
              className="
                mb-2
                block
                text-xs
                font-bold
                uppercase
                tracking-wide
                text-slate-600
              "
            >
              Patient History Lookup
            </label>


            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
              "
            >
              <div
                className="
                  relative
                  flex-1
                "
              >
                <Search
                  className="
                    absolute
                    left-3
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  value={
                    patientIdInput
                  }
                  onChange={
                    (
                      event
                    ) =>
                      setPatientIdInput(
                        event.target.value
                      )
                  }
                  placeholder="Enter patient User ID"
                  className={
              isDoctor
                ? `
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    py-2.5
                    pl-10
                    pr-4
                    text-sm
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  `
                : `
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    py-2.5
                    pl-10
                    pr-4
                    text-sm
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  `
            }
                />
              </div>


              <button
                type="submit"
                disabled={
                  loading
                  || !patientIdInput
                    .trim()
                }
                className={
              isDoctor
                ? `
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-700
                  disabled:opacity-50
                `
                : `
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-700
                  disabled:opacity-50
                `
            }
              >
                {loading
                  ? (
                    <Loader2
                      className="
                        h-4
                        w-4
                        animate-spin
                      "
                    />
                  )
                  : (
                    <Search
                      className="
                        h-4
                        w-4
                      "
                    />
                  )
                }

                Load History
              </button>
            </div>
          </form>
        )}


        {/* ==============================================
            ERROR
            ============================================== */}
        {error && (
          <div
            className="
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-red-200
              bg-red-50
              p-4
              text-red-700
            "
          >
            <AlertCircle
              className="
                mt-0.5
                h-5
                w-5
                shrink-0
              "
            />

            <div>
              <p
                className="
                  text-sm
                  font-semibold
                "
              >
                Unable to load history
              </p>

              <p
                className="
                  mt-1
                  text-sm
                "
              >
                {error}
              </p>
            </div>
          </div>
        )}


        {/* ==============================================
            LOADING
            ============================================== */}
        {loading
          && !history
          && (
            <div
              className="
                flex
                min-h-72
                items-center
                justify-center
                rounded-2xl
                border
                border-slate-200
                bg-white
              "
            >
              <div
                className="
                  text-center
                "
              >
                <Loader2
                  className={
              isDoctor
                ? `
                    mx-auto
                    h-8
                    w-8
                    animate-spin
                    text-blue-600
                  `
                : `
                    mx-auto
                    h-8
                    w-8
                    animate-spin
                    text-blue-600
                  `
            }
                />

                <p
                  className="
                    mt-3
                    text-sm
                    text-slate-500
                  "
                >
                  Loading patient history...
                </p>
              </div>
            </div>
          )
        }


        {/* ==============================================
            EMPTY LOOKUP STATE
            ============================================== */}
        {!loading
          && !history
          && !error
          && canSearchPatients
          && (
            <div
              className="
                flex
                min-h-72
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                border-slate-300
                bg-white
                p-8
              "
            >
              <div
                className="
                  max-w-md
                  text-center
                "
              >
                <CalendarDays
                  className="
                    mx-auto
                    h-10
                    w-10
                    text-slate-300
                  "
                />

                <h2
                  className="
                    mt-4
                    font-bold
                    text-slate-900
                  "
                >
                  Select a patient
                </h2>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-slate-500
                  "
                >
                  Enter a patient User ID
                  to view their complete
                  medical history.
                </p>
              </div>
            </div>
          )
        }


        {history && (
          <>
            {/* ==========================================
                PATIENT REFERENCE
                ========================================== */}
            <section
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <div>
                  <p
                    className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-wide
                      text-slate-400
                    "
                  >
                    Patient
                  </p>

                  <p
                    className="
                      mt-1
                      break-all
                      text-sm
                      font-bold
                      text-slate-800
                    "
                  >
                    {
                      history.patientId
                    }
                  </p>
                </div>


                <div
                  className="
                    rounded-xl
                    bg-slate-50
                    px-4
                    py-3
                  "
                >
                  <p
                    className="
                      text-xs
                      text-slate-400
                    "
                  >
                    History Generated
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    {formatDate(
                      history.generatedAt
                    )}
                  </p>
                </div>
              </div>
            </section>


            {/* ==========================================
                SUMMARY
                ========================================== */}
            <div
              className="
                grid
                gap-4
                sm:grid-cols-2
                xl:grid-cols-4
              "
            >
              <section
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-4
                  shadow-sm
                "
              >
                <FileText
                  className={
              isDoctor
                ? `
                    h-5
                    w-5
                    text-blue-600
                  `
                : `
                    h-5
                    w-5
                    text-blue-600
                  `
            }
                />

                <p
                  className="
                    mt-3
                    text-2xl
                    font-bold
                    text-slate-900
                  "
                >
                  {
                    history
                      .medicalRecords
                      .length
                  }
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    font-medium
                    text-slate-500
                  "
                >
                  Medical Records
                </p>
              </section>


              <section
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-4
                  shadow-sm
                "
              >
                <Stethoscope
                  className={
              isDoctor
                ? `
                    h-5
                    w-5
                    text-blue-600
                  `
                : `
                    h-5
                    w-5
                    text-indigo-600
                  `
            }
                />

                <p
                  className="
                    mt-3
                    text-2xl
                    font-bold
                    text-slate-900
                  "
                >
                  {
                    history
                      .diagnoses
                      .length
                  }
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    font-medium
                    text-slate-500
                  "
                >
                  Diagnoses
                </p>
              </section>


              <section
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-4
                  shadow-sm
                "
              >
                <Activity
                  className="
                    h-5
                    w-5
                    text-emerald-600
                  "
                />

                <p
                  className="
                    mt-3
                    text-2xl
                    font-bold
                    text-slate-900
                  "
                >
                  {
                    history
                      .treatments
                      .length
                  }
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    font-medium
                    text-slate-500
                  "
                >
                  Treatments
                </p>
              </section>


              <section
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-4
                  shadow-sm
                "
              >
                <CalendarDays
                  className="
                    h-5
                    w-5
                    text-amber-600
                  "
                />

                <p
                  className="
                    mt-3
                    text-lg
                    font-bold
                    text-slate-900
                  "
                >
                  {latestVisit
                    ? formatDate(
                        latestVisit.visitDate
                      )
                    : "N/A"
                  }
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    font-medium
                    text-slate-500
                  "
                >
                  Latest Visit
                </p>
              </section>
            </div>


            {/* ==========================================
                FILTERS
                ========================================== */}
            <section
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-2
                shadow-sm
              "
            >
              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                "
              >
                {[
                  {
                    key: "all",
                    label: "All History",
                  },
                  {
                    key: "visits",
                    label: "Visits",
                  },
                  {
                    key: "diagnoses",
                    label: "Diagnoses",
                  },
                  {
                    key: "treatments",
                    label: "Treatments",
                  },
                ].map(
                  (
                    item
                  ) => (
                    <button
                      key={
                        item.key
                      }
                      type="button"
                      onClick={() =>
                        setFilter(item.key as HistoryFilter)
                      }
                      className={`
                        rounded-xl
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        transition
                        ${
                          filter === item.key
                            ? (
                              (
                                isDoctor
                                  ? "bg-blue-600 "
                                  : "bg-blue-600 "
                              )
                              + "text-white"
                            )
                            : (
                              "text-slate-600 "
                              + "hover:bg-slate-50"
                            )
                        }
                      `}
                    >
                      {
                        item.label
                      }
                    </button>
                  )
                )}
              </div>
            </section>


            {/* ==========================================
                ALL HISTORY / VISITS
                ========================================== */}
            {(filter === "all"
              || filter === "visits")
              && (
                <section
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-5
                    shadow-sm
                  "
                >
                  <div>
                    <h2
                      className="
                        text-lg
                        font-bold
                        text-slate-900
                      "
                    >
                      Medical Visits
                    </h2>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-500
                      "
                    >
                      Complete chronological
                      Medical Record timeline.
                    </p>
                  </div>


                  {medicalRecords.length === 0
                    ? (
                      <div
                        className="
                          mt-5
                          rounded-xl
                          border
                          border-dashed
                          border-slate-200
                          p-10
                          text-center
                          text-sm
                          text-slate-500
                        "
                      >
                        No medical visits available.
                      </div>
                    )
                    : (
                      <div
                        className="
                          relative
                          mt-6
                          space-y-5
                          pl-7
                        "
                      >
                        <div
                          className={
              isDoctor
                ? `
                            absolute
                            bottom-4
                            left-[9px]
                            top-4
                            w-px
                            bg-blue-100
                          `
                : `
                            absolute
                            bottom-4
                            left-[9px]
                            top-4
                            w-px
                            bg-blue-100
                          `
            }
                        />


                        {medicalRecords.map(
                          (
                            record:
                            MedicalRecord,
                            index
                          ) => {
                            const recordDiagnoses =
                              getDiagnosesForRecord(
                                record.id
                              );

                            const recordTreatments =
                              getTreatmentsForRecord(
                                record.id
                              );

                            return (
                              <article
                                key={
                                  record.id
                                }
                                className="
                                  relative
                                  rounded-2xl
                                  border
                                  border-slate-200
                                  p-5
                                "
                              >
                                <span
                                  className={`
                                    absolute
                                    -left-[27px]
                                    top-7
                                    h-3
                                    w-3
                                    rounded-full
                                    ring-4
                                    ring-white
                                    ${
                                      isDoctor
                                        ? (
                                          index === 0
                                            ? "bg-blue-600"
                                            : "bg-blue-300"
                                        )
                                        : (
                                          index === 0
                                            ? "bg-blue-600"
                                            : "bg-blue-300"
                                        )
                                    }
                                  `}
                                />


                                <div
                                  className="
                                    flex
                                    flex-col
                                    gap-4
                                    lg:flex-row
                                    lg:justify-between
                                  "
                                >
                                  <div
                                    className="
                                      min-w-0
                                      flex-1
                                    "
                                  >
                                    <div
                                      className="
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-2
                                      "
                                    >
                                      <span
                                        className="
                                          text-xs
                                          font-semibold
                                          text-slate-500
                                        "
                                      >
                                        {formatDate(
                                          record.visitDate
                                        )}
                                      </span>

                                      <span
                                        className={
              isDoctor
                ? `
                                          rounded-full
                                          bg-blue-50
                                          px-2.5
                                          py-1
                                          text-[11px]
                                          font-bold
                                          text-blue-700
                                        `
                : `
                                          rounded-full
                                          bg-blue-50
                                          px-2.5
                                          py-1
                                          text-[11px]
                                          font-bold
                                          text-blue-700
                                        `
            }
                                      >
                                        {
                                          record.recordType
                                        }
                                      </span>

                                      {record.status && (
                                        <span
                                          className="
                                            rounded-full
                                            bg-emerald-50
                                            px-2.5
                                            py-1
                                            text-[11px]
                                            font-bold
                                            text-emerald-700
                                          "
                                        >
                                          {
                                            record.status
                                          }
                                        </span>
                                      )}
                                    </div>


                                    <h3
                                      className="
                                        mt-3
                                        text-lg
                                        font-bold
                                        text-slate-900
                                      "
                                    >
                                      {
                                        record.diagnosis
                                      }
                                    </h3>


                                    <p
                                      className="
                                        mt-2
                                        text-sm
                                        leading-6
                                        text-slate-600
                                      "
                                    >
                                      {
                                        record.clinicalSummary
                                      }
                                    </p>


                                    {record.symptoms
                                      ?.length > 0
                                      && (
                                        <div
                                          className="
                                            mt-4
                                          "
                                        >
                                          <p
                                            className="
                                              text-xs
                                              font-bold
                                              uppercase
                                              tracking-wide
                                              text-slate-400
                                            "
                                          >
                                            Symptoms
                                          </p>

                                          <div
                                            className="
                                              mt-2
                                              flex
                                              flex-wrap
                                              gap-2
                                            "
                                          >
                                            {record.symptoms.map(
                                              (
                                                symptom
                                              ) => (
                                                <span
                                                  key={
                                                    symptom
                                                  }
                                                  className="
                                                    rounded-lg
                                                    bg-rose-50
                                                    px-2.5
                                                    py-1.5
                                                    text-xs
                                                    font-medium
                                                    text-rose-700
                                                  "
                                                >
                                                  {
                                                    symptom
                                                  }
                                                </span>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )
                                    }


                                    {record.consultationNotes && (
                                      <div
                                        className="
                                          mt-4
                                          rounded-xl
                                          bg-slate-50
                                          p-3
                                        "
                                      >
                                        <p
                                          className="
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-wide
                                            text-slate-400
                                          "
                                        >
                                          Consultation Note
                                        </p>

                                        <p
                                          className="
                                            mt-2
                                            whitespace-pre-wrap
                                            text-sm
                                            leading-6
                                            text-slate-600
                                          "
                                        >
                                          {
                                            record.consultationNotes
                                          }
                                        </p>
                                      </div>
                                    )}


                                    {recordDiagnoses.length > 0 && (
                                      <div
                                        className="
                                          mt-4
                                        "
                                      >
                                        <p
                                          className="
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-wide
                                            text-slate-400
                                          "
                                        >
                                          Diagnoses
                                        </p>

                                        <div
                                          className="
                                            mt-2
                                            grid
                                            gap-2
                                            md:grid-cols-2
                                          "
                                        >
                                          {recordDiagnoses.map(
                                            (
                                              diagnosis
                                            ) => (
                                              <div
                                                key={
                                                  diagnosis.id
                                                }
                                                className={
              isDoctor
                ? `
                                                  rounded-xl
                                                  border
                                                  border-blue-100
                                                  bg-blue-50/50
                                                  p-3
                                                `
                : `
                                                  rounded-xl
                                                  border
                                                  border-indigo-100
                                                  bg-indigo-50/50
                                                  p-3
                                                `
            }
                                              >
                                                <div
                                                  className="
                                                    flex
                                                    items-start
                                                    justify-between
                                                    gap-2
                                                  "
                                                >
                                                  <p
                                                    className={
              isDoctor
                ? `
                                                      text-sm
                                                      font-semibold
                                                      text-blue-900
                                                    `
                : `
                                                      text-sm
                                                      font-semibold
                                                      text-indigo-900
                                                    `
            }
                                                  >
                                                    {
                                                      diagnosis.diagnosisName
                                                    }
                                                  </p>

                                                  {diagnosis.severity && (
                                                    <span
                                                      className={
              isDoctor
                ? `
                                                        rounded-full
                                                        bg-white
                                                        px-2
                                                        py-1
                                                        text-[10px]
                                                        font-bold
                                                        uppercase
                                                        text-blue-600
                                                      `
                : `
                                                        rounded-full
                                                        bg-white
                                                        px-2
                                                        py-1
                                                        text-[10px]
                                                        font-bold
                                                        uppercase
                                                        text-indigo-600
                                                      `
            }
                                                    >
                                                      {
                                                        diagnosis.severity
                                                      }
                                                    </span>
                                                  )}
                                                </div>

                                                {diagnosis.description && (
                                                  <p
                                                    className={
              isDoctor
                ? `
                                                      mt-2
                                                      text-xs
                                                      leading-5
                                                      text-blue-700
                                                    `
                : `
                                                      mt-2
                                                      text-xs
                                                      leading-5
                                                      text-indigo-700
                                                    `
            }
                                                  >
                                                    {
                                                      diagnosis.description
                                                    }
                                                  </p>
                                                )}
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}


                                    {recordTreatments.length > 0 && (
                                      <div
                                        className="
                                          mt-4
                                        "
                                      >
                                        <p
                                          className="
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-wide
                                            text-slate-400
                                          "
                                        >
                                          Treatments
                                        </p>

                                        <div
                                          className="
                                            mt-2
                                            grid
                                            gap-2
                                            md:grid-cols-2
                                          "
                                        >
                                          {recordTreatments.map(
                                            (
                                              treatment
                                            ) => (
                                              <div
                                                key={
                                                  treatment.id
                                                }
                                                className="
                                                  rounded-xl
                                                  border
                                                  border-emerald-100
                                                  bg-emerald-50/50
                                                  p-3
                                                "
                                              >
                                                <div
                                                  className="
                                                    flex
                                                    items-start
                                                    justify-between
                                                    gap-2
                                                  "
                                                >
                                                  <p
                                                    className="
                                                      text-sm
                                                      font-semibold
                                                      text-emerald-900
                                                    "
                                                  >
                                                    {
                                                      treatment.treatmentType
                                                    }
                                                  </p>

                                                  {treatment.status && (
                                                    <span
                                                      className="
                                                        rounded-full
                                                        bg-white
                                                        px-2
                                                        py-1
                                                        text-[10px]
                                                        font-bold
                                                        uppercase
                                                        text-emerald-600
                                                      "
                                                    >
                                                      {
                                                        treatment.status
                                                      }
                                                    </span>
                                                  )}
                                                </div>

                                                {treatment.description && (
                                                  <p
                                                    className="
                                                      mt-2
                                                      text-xs
                                                      leading-5
                                                      text-emerald-700
                                                    "
                                                  >
                                                    {
                                                      treatment.description
                                                    }
                                                  </p>
                                                )}

                                                <p
                                                  className="
                                                    mt-2
                                                    text-[11px]
                                                    text-emerald-600
                                                  "
                                                >
                                                  {formatDate(
                                                    treatment.startDate
                                                  )}

                                                  {treatment.endDate
                                                    ? (
                                                      <>
                                                        {" → "}
                                                        {formatDate(
                                                          treatment.endDate
                                                        )}
                                                      </>
                                                    )
                                                    : " → Ongoing"
                                                  }
                                                </p>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>


                                  <div
                                    className="
                                      flex
                                      h-fit
                                      shrink-0
                                      flex-col
                                      gap-2
                                      lg:w-48
                                    "
                                  >
                                    <div
                                      className="
                                        rounded-xl
                                        bg-slate-50
                                        px-3
                                        py-3
                                      "
                                    >
                                      <p
                                        className="
                                          text-xs
                                          text-slate-400
                                        "
                                      >
                                        Doctor
                                      </p>

                                      <p
                                        className="
                                          mt-1
                                          text-sm
                                          font-semibold
                                          text-slate-700
                                        "
                                      >
                                        {
                                          record.doctorName
                                        }
                                      </p>

                                      <p
                                        className="
                                          mt-2
                                          text-xs
                                          text-slate-400
                                        "
                                      >
                                        Hospital
                                      </p>

                                      <p
                                        className="
                                          mt-1
                                          text-xs
                                          font-medium
                                          text-slate-600
                                        "
                                      >
                                        {
                                          record.hospitalName
                                        }
                                      </p>
                                    </div>


                                    <Link
                                      href={
                                        `/medical-records/${
                                          encodeURIComponent(
                                            record.id
                                          )
                                        }`
                                      }
                                      className={
              isDoctor
                ? `
                                        inline-flex
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-blue-600
                                        px-3
                                        py-2.5
                                        text-xs
                                        font-semibold
                                        text-white
                                        transition
                                        hover:bg-blue-700
                                      `
                : `
                                        inline-flex
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-blue-600
                                        px-3
                                        py-2.5
                                        text-xs
                                        font-semibold
                                        text-white
                                        transition
                                        hover:bg-blue-700
                                      `
            }
                                    >
                                      View Details
                                    </Link>
                                  </div>
                                </div>
                              </article>
                            );
                          }
                        )}
                      </div>
                    )
                  }
                </section>
              )
            }


            {/* ==========================================
                DIAGNOSES ONLY
                ========================================== */}
            {filter === "diagnoses" && (
              <section
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                  shadow-sm
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Stethoscope
                    className={
              isDoctor
                ? `
                      h-5
                      w-5
                      text-blue-600
                    `
                : `
                      h-5
                      w-5
                      text-indigo-600
                    `
            }
                  />

                  <h2
                    className="
                      text-lg
                      font-bold
                      text-slate-900
                    "
                  >
                    Diagnosis History
                  </h2>

                  <span
                    className={
              isDoctor
                ? `
                      rounded-full
                      bg-blue-50
                      px-2.5
                      py-1
                      text-xs
                      font-bold
                      text-blue-700
                    `
                : `
                      rounded-full
                      bg-indigo-50
                      px-2.5
                      py-1
                      text-xs
                      font-bold
                      text-indigo-700
                    `
            }
                  >
                    {
                      history.diagnoses.length
                    }
                  </span>
                </div>


                {history.diagnoses.length === 0
                  ? (
                    <div
                      className="
                        mt-5
                        rounded-xl
                        border
                        border-dashed
                        border-slate-200
                        p-10
                        text-center
                        text-sm
                        text-slate-500
                      "
                    >
                      No diagnosis history available.
                    </div>
                  )
                  : (
                    <div
                      className="
                        mt-5
                        grid
                        gap-4
                        md:grid-cols-2
                        xl:grid-cols-3
                      "
                    >
                      {history.diagnoses.map(
                        (
                          diagnosis
                        ) => (
                          <article
                            key={
                              diagnosis.id
                            }
                            className={
              isDoctor
                ? `
                              rounded-2xl
                              border
                              border-blue-100
                              bg-blue-50/50
                              p-4
                            `
                : `
                              rounded-2xl
                              border
                              border-indigo-100
                              bg-indigo-50/50
                              p-4
                            `
            }
                          >
                            <div
                              className="
                                flex
                                items-start
                                justify-between
                                gap-3
                              "
                            >
                              <h3
                                className={
              isDoctor
                ? `
                                  font-bold
                                  text-blue-950
                                `
                : `
                                  font-bold
                                  text-indigo-950
                                `
            }
                              >
                                {
                                  diagnosis.diagnosisName
                                }
                              </h3>

                              {diagnosis.severity && (
                                <span
                                  className={
              isDoctor
                ? `
                                    rounded-full
                                    bg-white
                                    px-2.5
                                    py-1
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    text-blue-600
                                  `
                : `
                                    rounded-full
                                    bg-white
                                    px-2.5
                                    py-1
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    text-indigo-600
                                  `
            }
                                >
                                  {
                                    diagnosis.severity
                                  }
                                </span>
                              )}
                            </div>


                            {diagnosis.description && (
                              <p
                                className={
              isDoctor
                ? `
                                  mt-3
                                  text-sm
                                  leading-6
                                  text-blue-700
                                `
                : `
                                  mt-3
                                  text-sm
                                  leading-6
                                  text-indigo-700
                                `
            }
                              >
                                {
                                  diagnosis.description
                                }
                              </p>
                            )}


                            <p
                              className={
              isDoctor
                ? `
                                mt-4
                                text-xs
                                text-blue-500
                              `
                : `
                                mt-4
                                text-xs
                                text-indigo-500
                              `
            }
                            >
                              Diagnosed:{" "}
                              {formatDate(
                                diagnosis.diagnosedDate
                              )}
                            </p>


                            <Link
                              href={
                                `/medical-records/${
                                  encodeURIComponent(
                                    diagnosis.medicalRecordId
                                  )
                                }`
                              }
                              className={
              isDoctor
                ? `
                                mt-4
                                inline-flex
                                rounded-lg
                                border
                                border-blue-200
                                bg-white
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-blue-700
                                transition
                                hover:bg-blue-50
                              `
                : `
                                mt-4
                                inline-flex
                                rounded-lg
                                border
                                border-indigo-200
                                bg-white
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-indigo-700
                                transition
                                hover:bg-indigo-50
                              `
            }
                            >
                              View Medical Record
                            </Link>
                          </article>
                        )
                      )}
                    </div>
                  )
                }
              </section>
            )}


            {/* ==========================================
                TREATMENTS ONLY
                ========================================== */}
            {filter === "treatments" && (
              <section
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                  shadow-sm
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Activity
                    className="
                      h-5
                      w-5
                      text-emerald-600
                    "
                  />

                  <h2
                    className="
                      text-lg
                      font-bold
                      text-slate-900
                    "
                  >
                    Treatment History
                  </h2>

                  <span
                    className="
                      rounded-full
                      bg-emerald-50
                      px-2.5
                      py-1
                      text-xs
                      font-bold
                      text-emerald-700
                    "
                  >
                    {
                      history.treatments.length
                    }
                  </span>
                </div>


                {history.treatments.length === 0
                  ? (
                    <div
                      className="
                        mt-5
                        rounded-xl
                        border
                        border-dashed
                        border-slate-200
                        p-10
                        text-center
                        text-sm
                        text-slate-500
                      "
                    >
                      No treatment history available.
                    </div>
                  )
                  : (
                    <div
                      className="
                        mt-5
                        grid
                        gap-4
                        md:grid-cols-2
                        xl:grid-cols-3
                      "
                    >
                      {history.treatments.map(
                        (
                          treatment
                        ) => (
                          <article
                            key={
                              treatment.id
                            }
                            className="
                              rounded-2xl
                              border
                              border-emerald-100
                              bg-emerald-50/50
                              p-4
                            "
                          >
                            <div
                              className="
                                flex
                                items-start
                                justify-between
                                gap-3
                              "
                            >
                              <h3
                                className="
                                  font-bold
                                  text-emerald-950
                                "
                              >
                                {
                                  treatment.treatmentType
                                }
                              </h3>

                              {treatment.status && (
                                <span
                                  className="
                                    rounded-full
                                    bg-white
                                    px-2.5
                                    py-1
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    text-emerald-600
                                  "
                                >
                                  {
                                    treatment.status
                                  }
                                </span>
                              )}
                            </div>


                            {treatment.description && (
                              <p
                                className="
                                  mt-3
                                  text-sm
                                  leading-6
                                  text-emerald-700
                                "
                              >
                                {
                                  treatment.description
                                }
                              </p>
                            )}


                            <p
                              className="
                                mt-4
                                text-xs
                                text-emerald-600
                              "
                            >
                              {formatDate(
                                treatment.startDate
                              )}

                              {treatment.endDate
                                ? (
                                  <>
                                    {" → "}
                                    {formatDate(
                                      treatment.endDate
                                    )}
                                  </>
                                )
                                : " → Ongoing"
                              }
                            </p>


                            <Link
                              href={
                                `/medical-records/${
                                  encodeURIComponent(
                                    treatment.medicalRecordId
                                  )
                                }`
                              }
                              className="
                                mt-4
                                inline-flex
                                rounded-lg
                                border
                                border-emerald-200
                                bg-white
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-emerald-700
                                transition
                                hover:bg-emerald-50
                              "
                            >
                              View Medical Record
                            </Link>
                          </article>
                        )
                      )}
                    </div>
                  )
                }
              </section>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}