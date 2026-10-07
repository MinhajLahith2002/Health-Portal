"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertCircle,
  Archive,
  CalendarDays,
  FileText,
  FolderOpen,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Stethoscope,
  UserRound,
  X,
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
  MedicalDocument,
  MedicalRecord,
  PatientEhrHistory,
  PatientLookupResult,
} from "@/types/medicalRecord";


type TabType =
  | "history"
  | "notes"
  | "documents";


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


function formatFileSize(
  bytes?: number
): string {
  if (!bytes) {
    return "0 KB";
  }

  const kb =
    bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(
    kb / 1024
  ).toFixed(1)} MB`;
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
          data?: {
            message?: string;
          };
        };
      };

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

    if (
      requestError
        .response
        ?.status === 403
    ) {
      return (
        "You do not have permission "
        + "to access this patient EHR."
      );
    }

    if (
      requestError
        .response
        ?.status === 404
    ) {
      return "Patient EHR was not found.";
    }
  }

  return "Unable to load Electronic Health Record.";
}


export default function MedicalRecordsPage() {
  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<AuthUser | null>(
      null
    );


  /*
   * Doctor's existing EHR patients.
   */
  const [
    doctorPatients,
    setDoctorPatients,
  ] =
    useState<PatientLookupResult[]>(
      []
    );


  const [
    doctorPatientsLoading,
    setDoctorPatientsLoading,
  ] =
    useState(false);


  /*
   * Search any registered patient.
   */
  const [
    patientSearch,
    setPatientSearch,
  ] =
    useState("");


  const [
    patientResults,
    setPatientResults,
  ] =
    useState<PatientLookupResult[]>(
      []
    );


  const [
    patientSearchOpen,
    setPatientSearchOpen,
  ] =
    useState(false);


  const [
    searchingPatients,
    setSearchingPatients,
  ] =
    useState(false);


  const [
    patientSearchError,
    setPatientSearchError,
  ] =
    useState("");


  /*
   * Active patient EHR.
   */
  const [
    activePatient,
    setActivePatient,
  ] =
    useState<PatientLookupResult | null>(
      null
    );


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
    activeTab,
    setActiveTab,
  ] =
    useState<TabType>(
      "history"
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


  const canSearchPatients =
    currentUser?.role === "DOCTOR"
    || currentUser?.role === "ADMIN"
    || currentUser?.role === "SUPER_ADMIN";


  const isDoctor =
    currentUser?.role
    === "DOCTOR";


  /*
   * ADMIN / SUPER_ADMIN can manage archived EHR records.
   *
   * We derive this from the already-working EHR search permission
   * and exclude DOCTOR. This is more robust for the shared auth shell:
   *
   * DOCTOR       -> canSearchPatients = true,  isDoctor = true  -> false
   * ADMIN        -> canSearchPatients = true,  isDoctor = false -> true
   * SUPER_ADMIN  -> canSearchPatients = true,  isDoctor = false -> true
   * PATIENT      -> canSearchPatients = false                    -> false
   */
  const canManageArchivedRecords =
    canSearchPatients
    && !isDoctor;


  /*
   * =========================================================
   * LOAD EHR
   * =========================================================
   */
  const loadPatientEhr =
    async (
      patientId: string,
      patient?: PatientLookupResult
    ) => {
      const normalizedId =
        patientId.trim();


      if (!normalizedId) {
        return;
      }


      setLoading(
        true
      );

      setError(
        ""
      );


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


        if (patient) {
          setActivePatient(
            patient
          );
        }


        setActiveTab(
          "history"
        );


        /*
         * Keep URL useful without page reload.
         */
        if (
          typeof window
          !== "undefined"
        ) {
          const url =
            new URL(
              window.location.href
            );

          url.searchParams.set(
            "patientId",
            normalizedId
          );

          window.history.replaceState(
            {},
            "",
            url.toString()
          );
        }
      } catch (
        requestError
      ) {
        setHistory(
          null
        );

        setActivePatientId(
          ""
        );

        setError(
          getErrorMessage(
            requestError
          )
        );
      } finally {
        setLoading(
          false
        );
      }
    };


  /*
   * =========================================================
   * LOAD DOCTOR'S OWN EHR PATIENT LIST
   * =========================================================
   */
  const loadDoctorPatients =
    async () => {
      setDoctorPatientsLoading(
        true
      );


      try {
        const results =
          await medicalRecordService
            .getMyPatients();


        setDoctorPatients(
          results
        );
      } catch (
        requestError
      ) {
        console.error(
          "Unable to load doctor's EHR patients:",
          requestError
        );

        setDoctorPatients(
          []
        );
      } finally {
        setDoctorPatientsLoading(
          false
        );
      }
    };


  /*
   * =========================================================
   * INITIAL AUTH
   * =========================================================
   */
  useEffect(
    () => {
      const storedUser =
        getStoredUser();


      if (!storedUser) {
        setError(
          "Please login to access Medical Records."
        );

        return;
      }


      setCurrentUser(
        storedUser
      );


      /*
       * PATIENT:
       * automatically load own EHR.
       */
      if (
        storedUser.role
        === "PATIENT"
      ) {
        void loadPatientEhr(
          storedUser.id,
          {
            id:
              storedUser.id,

            fullName:
              storedUser.fullName
              || "Patient",
          }
        );

        return;
      }


      /*
       * DOCTOR:
       * load patients this doctor
       * already has EHR records for.
       */
      if (
        storedUser.role
        === "DOCTOR"
      ) {
        void loadDoctorPatients();
      }


      /*
       * Support:
       *
       * /medical-records?patientId=...
       */
      const params =
        new URLSearchParams(
          window.location.search
        );


      const patientId =
        params
          .get("patientId")
          ?.trim();


      if (patientId) {
        void loadPatientEhr(
          patientId
        );
      }
    },
    []
  );


  /*
   * =========================================================
   * SEARCH PATIENTS
   * =========================================================
   */
  useEffect(
    () => {
      if (!canSearchPatients) {
        return;
      }


      const query =
        patientSearch.trim();


      if (
        query.length === 0
      ) {
        setPatientResults(
          []
        );

        setPatientSearchError(
          ""
        );

        setSearchingPatients(
          false
        );

        return;
      }


      let cancelled =
        false;


      const timeout =
        window.setTimeout(
          () => {
            const search =
              async () => {
                setSearchingPatients(
                  true
                );

                setPatientSearchError(
                  ""
                );


                try {
                  const results =
                    await medicalRecordService
                      .searchPatients(
                        query
                      );


                  if (cancelled) {
                    return;
                  }


                  setPatientResults(
                    results
                  );

                  setPatientSearchOpen(
                    true
                  );
                } catch (
                  requestError
                ) {
                  if (cancelled) {
                    return;
                  }


                  setPatientResults(
                    []
                  );

                  setPatientSearchError(
                    getErrorMessage(
                      requestError
                    )
                  );
                } finally {
                  if (!cancelled) {
                    setSearchingPatients(
                      false
                    );
                  }
                }
              };


            void search();
          },
          350
        );


      return () => {
        cancelled = true;

        window.clearTimeout(
          timeout
        );
      };
    },
    [
      patientSearch,
      canSearchPatients,
    ]
  );


  /*
   * =========================================================
   * OPEN SEARCH FIELD
   * =========================================================
   */
  const openPatientSearch =
    async () => {
      setPatientSearchOpen(
        true
      );


      if (
        patientSearch.trim()
        || patientResults.length > 0
      ) {
        return;
      }


      setSearchingPatients(
        true
      );

      setPatientSearchError(
        ""
      );


      try {
        const results =
          await medicalRecordService
            .searchPatients(
              ""
            );


        setPatientResults(
          results
        );
      } catch (
        requestError
      ) {
        setPatientResults(
          []
        );

        setPatientSearchError(
          getErrorMessage(
            requestError
          )
        );
      } finally {
        setSearchingPatients(
          false
        );
      }
    };


  /*
   * =========================================================
   * CLOSE PATIENT LIST
   * =========================================================
   *
   * Clear the search state as well so an in-flight/debounced
   * search cannot immediately reopen the patient dropdown.
   */
  const closePatientSearch =
    () => {

      setPatientSearchOpen(
        false
      );

      setPatientSearch(
        ""
      );

      setPatientResults(
        []
      );

      setPatientSearchError(
        ""
      );

      setSearchingPatients(
        false
      );
    };


  const selectPatient =
    (
      patient:
      PatientLookupResult
    ) => {
      setActivePatient(
        patient
      );

      setPatientSearch(
        ""
      );

      setPatientResults(
        []
      );

      setPatientSearchOpen(
        false
      );


      void loadPatientEhr(
        patient.id,
        patient
      );
    };


  const handleRefresh =
    () => {
      if (!activePatientId) {
        return;
      }


      void loadPatientEhr(
        activePatientId,
        activePatient ?? undefined
      );


      if (isDoctor) {
        void loadDoctorPatients();
      }
    };


  /*
   * =========================================================
   * DERIVED EHR DATA
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


  const consultationRecords =
    useMemo(
      () =>
        medicalRecords.filter(
          (
            record
          ) =>
            Boolean(
              record
                .consultationNotes
                ?.trim()
            )
        ),
      [
        medicalRecords,
      ]
    );


  const documents =
    history?.documents
    ?? [];


  const getDiagnosesForRecord =
    (
      recordId: string
    ) =>
      history?.diagnoses.filter(
        (
          diagnosis
        ) =>
          diagnosis.medicalRecordId
          === recordId
      )
      ?? [];


  const getTreatmentsForRecord =
    (
      recordId: string
    ) =>
      history?.treatments.filter(
        (
          treatment
        ) =>
          treatment.medicalRecordId
          === recordId
      )
      ?? [];


  const historyHref =
    activePatientId
      ? (
        `/medical-records/history?patientId=${
          encodeURIComponent(
            activePatientId
          )
        }`
      )
      : "/medical-records/history";


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


  /*
   * Generic create action:
   * doctor intentionally chooses a patient.
   */
  const createHref =
    "/medical-records/create";


  /*
   * Context-aware create action:
   * used from the currently selected patient card.
   */
  const selectedPatientCreateHref =
    activePatientId
      ? (
        `/medical-records/create?patientId=${
          encodeURIComponent(
            activePatientId
          )
        }`
      )
      : createHref;


  return (
    <DashboardLayout
      pageTitle="Electronic Health Record"
    >
      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          space-y-5
        "
      >
        {/* HEADER */}
        <div
          className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-start
            lg:justify-between
          "
        >
          <div>
            <p
              className={
                  isDoctor
                    ? `
                text-sm
                font-semibold
                text-blue-600
              `
                    : `
                text-sm
                font-semibold
                text-blue-600
              `
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
              Electronic Health Record
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Medical history, diagnoses,
              treatments, consultation notes
              and clinical documents.
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
                href={createHref}
                className={
                  isDoctor
                    ? `
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  hover:bg-blue-700
                `
                    : `
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  hover:bg-blue-700
                `
                }
              >
                <Plus className="h-4 w-4" />

                New Medical Record
              </Link>
            )}


            {canManageArchivedRecords && (
              <Link
                href="/medical-records/archived"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-amber-200
                  bg-amber-50
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-amber-700
                  shadow-sm
                  transition
                  hover:bg-amber-100
                "
              >
                <Archive
                  className="
                    h-4
                    w-4
                  "
                />

                Archived Medical Records
              </Link>
            )}


            {activePatientId && (
              <>
                <Link
                  href={historyHref}
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Full History
                </Link>

                <Link
                  href={documentsHref}
                  className="
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Documents
                </Link>

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="
                    inline-flex
                    items-center
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
                  "
                >
                  <RefreshCw
                    className={`
                      h-4
                      w-4
                      ${
                        loading
                          ? "animate-spin"
                          : ""
                      }
                    `}
                  />

                  Refresh
                </button>
              </>
            )}
          </div>
        </div>


        {/* ==============================================
            DOCTOR -> MY EHR PATIENTS
            ============================================== */}
        {isDoctor && (
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
                items-start
                justify-between
                gap-3
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
                  My EHR Patients
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  Patients for whom you already
                  created at least one active
                  Medical Record.
                </p>
              </div>


              {doctorPatientsLoading && (
                <Loader2
                  className={
                  isDoctor
                    ? `
                    h-5
                    w-5
                    animate-spin
                    text-blue-600
                  `
                    : `
                    h-5
                    w-5
                    animate-spin
                    text-blue-600
                  `
                }
                />
              )}
            </div>


            {!doctorPatientsLoading
              && doctorPatients.length === 0
              && (
                <div
                  className="
                    mt-5
                    rounded-xl
                    border
                    border-dashed
                    border-slate-200
                    p-8
                    text-center
                  "
                >
                  <UserRound
                    className="
                      mx-auto
                      h-8
                      w-8
                      text-slate-300
                    "
                  />

                  <p
                    className="
                      mt-3
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    No EHR patients yet
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-500
                    "
                  >
                    Create the first Medical Record
                    for a registered patient.
                  </p>
                </div>
              )
            }


            {doctorPatients.length > 0 && (
              <div
                className="
                  mt-5
                  grid
                  gap-3
                  md:grid-cols-2
                  xl:grid-cols-3
                "
              >
                {doctorPatients.map(
                  (
                    patient
                  ) => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={
                        () =>
                          selectPatient(
                            patient
                          )
                      }
                      className={
                  isDoctor
                    ? `
                        rounded-2xl
                        border
                        border-slate-200
                        p-4
                        text-left
                        transition
                        hover:border-blue-300
                        hover:bg-blue-50/40
                      `
                    : `
                        rounded-2xl
                        border
                        border-slate-200
                        p-4
                        text-left
                        transition
                        hover:border-blue-300
                        hover:bg-blue-50/40
                      `
                }
                    >
                      <div
                        className="
                          flex
                          items-start
                          gap-3
                        "
                      >
                        <div
                          className={
                  isDoctor
                    ? `
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-xl
                            bg-blue-50
                            text-blue-600
                          `
                    : `
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-xl
                            bg-blue-50
                            text-blue-600
                          `
                }
                        >
                          {patient.picture
                            ? (
                              <img
                                src={patient.picture}
                                alt=""
                                className="
                                  h-full
                                  w-full
                                  object-cover
                                "
                              />
                            )
                            : (
                              <UserRound
                                className="
                                  h-5
                                  w-5
                                "
                              />
                            )
                          }
                        </div>


                        <div className="min-w-0 flex-1">
                          <p
                            className="
                              truncate
                              text-sm
                              font-bold
                              text-slate-900
                            "
                          >
                            {patient.fullName}
                          </p>

                          <p
                            className="
                              mt-1
                              truncate
                              text-xs
                              text-slate-500
                            "
                          >
                            Patient ID:{" "}
                            {patient.id}
                          </p>
                        </div>
                      </div>


                      <div
                        className="
                          mt-4
                          flex
                          items-center
                          justify-between
                          border-t
                          border-slate-100
                          pt-3
                          text-xs
                        "
                      >
                        <span
                          className={
                  isDoctor
                    ? `
                            font-semibold
                            text-blue-600
                          `
                    : `
                            font-semibold
                            text-blue-600
                          `
                }
                        >
                          {patient.recordCount ?? 0}{" "}
                          record
                          {
                            patient.recordCount === 1
                              ? ""
                              : "s"
                          }
                        </span>

                        <span
                          className="
                            text-slate-400
                          "
                        >
                          Last:{" "}
                          {formatDate(
                            patient.lastVisitDate
                          )}
                        </span>
                      </div>
                    </button>
                  )
                )}
              </div>
            )}
          </section>
        )}


        {/* ==============================================
            SEARCH REGISTERED PATIENT EHR
            ============================================== */}
        {canSearchPatients && (
          <section
            className={
                  isDoctor
                    ? `
              rounded-2xl
              border
              border-blue-100
              bg-blue-50/60
              p-4
            `
                    : `
              rounded-2xl
              border
              border-blue-100
              bg-blue-50/60
              p-4
            `
                }
          >
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-wide
                text-slate-700
              "
            >
              Find Patient EHR
            </p>


            <div
              className="
                relative
                mt-3
              "
            >
              <div className="relative">
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
                  type="search"
                  value={patientSearch}
                  onFocus={
                    () => {
                      void openPatientSearch();
                    }
                  }
                  onChange={
                    (
                      event
                    ) => {
                      setPatientSearch(
                        event.target.value
                      );

                      setPatientSearchOpen(
                        true
                      );
                    }
                  }
                  placeholder="Search patient by name or exact Patient ID..."
                  className={
                  isDoctor
                    ? `
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    py-3
                    pl-10
                    pr-10
                    text-sm
                    outline-none
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
                    py-3
                    pl-10
                    pr-10
                    text-sm
                    outline-none
                    focus:border-blue-500
                    focus:ring-2
                    focus:ring-blue-100
                  `
                }
                />

                {searchingPatients && (
                  <Loader2
                    className={
                  isDoctor
                    ? `
                      absolute
                      right-3
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      animate-spin
                      text-blue-600
                    `
                    : `
                      absolute
                      right-3
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      animate-spin
                      text-blue-600
                    `
                }
                  />
                )}
              </div>


              {patientSearchError && (
                <p
                  className="
                    mt-2
                    text-xs
                    text-red-600
                  "
                >
                  {patientSearchError}
                </p>
              )}


              {patientSearchOpen && (
                <div
                  className="
                    absolute
                    left-0
                    right-0
                    z-30
                    mt-2
                    max-h-80
                    overflow-y-auto
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-2
                    shadow-xl
                  "
                >

                  <div
                    className="
                      sticky
                      top-0
                      z-10
                      mb-1
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      bg-white
                      px-3
                      py-2
                      shadow-sm
                    "
                  >
                    <div>
                      <p
                        className="
                          text-xs
                          font-bold
                          uppercase
                          tracking-wide
                          text-slate-500
                        "
                      >
                        Patients
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[11px]
                          text-slate-400
                        "
                      >
                        Select a patient to open their EHR.
                      </p>
                    </div>


                    <button
                      type="button"
                      onClick={
                        closePatientSearch
                      }
                      aria-label="Close patient list"
                      title="Close patient list"
                      className="
                        inline-flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        text-slate-500
                        transition
                        hover:border-red-200
                        hover:bg-red-50
                        hover:text-red-600
                      "
                    >
                      <X
                        className="
                          h-4
                          w-4
                        "
                      />
                    </button>
                  </div>


                  {searchingPatients
                    && patientResults.length === 0
                    ? (
                      <div
                        className="
                          flex
                          items-center
                          justify-center
                          gap-2
                          p-8
                          text-sm
                          text-slate-500
                        "
                      >
                        <Loader2
                          className="
                            h-4
                            w-4
                            animate-spin
                          "
                        />

                        Searching patients...
                      </div>
                    )
                    : patientResults.length === 0
                      ? (
                        <div
                          className="
                            p-8
                            text-center
                          "
                        >
                          <UserRound
                            className="
                              mx-auto
                              h-8
                              w-8
                              text-slate-300
                            "
                          />

                          <p
                            className="
                              mt-2
                              text-sm
                              font-semibold
                            "
                          >
                            No patients found
                          </p>
                        </div>
                      )
                      : (
                        patientResults.map(
                          (
                            patient
                          ) => (
                            <button
                              key={patient.id}
                              type="button"
                              onClick={
                                () =>
                                  selectPatient(
                                    patient
                                  )
                              }
                              className={
                  isDoctor
                    ? `
                                flex
                                w-full
                                items-start
                                gap-3
                                rounded-xl
                                p-3
                                text-left
                                hover:bg-blue-50
                              `
                    : `
                                flex
                                w-full
                                items-start
                                gap-3
                                rounded-xl
                                p-3
                                text-left
                                hover:bg-blue-50
                              `
                }
                            >
                              <div
                                className={
                  isDoctor
                    ? `
                                  flex
                                  h-10
                                  w-10
                                  shrink-0
                                  items-center
                                  justify-center
                                  overflow-hidden
                                  rounded-xl
                                  bg-slate-100
                                  text-blue-600
                                `
                    : `
                                  flex
                                  h-10
                                  w-10
                                  shrink-0
                                  items-center
                                  justify-center
                                  overflow-hidden
                                  rounded-xl
                                  bg-slate-100
                                  text-blue-600
                                `
                }
                              >
                                {patient.picture
                                  ? (
                                    <img
                                      src={patient.picture}
                                      alt=""
                                      className="
                                        h-full
                                        w-full
                                        object-cover
                                      "
                                    />
                                  )
                                  : (
                                    <UserRound
                                      className="
                                        h-5
                                        w-5
                                      "
                                    />
                                  )
                                }
                              </div>


                              <div className="min-w-0">
                                <p
                                  className="
                                    truncate
                                    text-sm
                                    font-bold
                                  "
                                >
                                  {patient.fullName}
                                </p>

                                <p
                                  className="
                                    mt-1
                                    break-all
                                    text-xs
                                    text-slate-500
                                  "
                                >
                                  Patient ID:{" "}
                                  {patient.id}
                                </p>

                                <div
                                  className="
                                    mt-1
                                    flex
                                    flex-wrap
                                    gap-2
                                    text-[11px]
                                    text-slate-500
                                  "
                                >
                                  {patient.dateOfBirth && (
                                    <span>
                                      DOB:{" "}
                                      {patient.dateOfBirth}
                                    </span>
                                  )}

                                  {patient.gender && (
                                    <span>
                                      {patient.gender}
                                    </span>
                                  )}

                                  {patient.bloodGroup && (
                                    <span
                                      className="
                                        text-rose-600
                                      "
                                    >
                                      Blood:{" "}
                                      {patient.bloodGroup}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          )
                        )
                      )
                  }
                </div>
              )}
            </div>
          </section>
        )}


        {/* ERROR */}
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
            <AlertCircle className="mt-0.5 h-5 w-5" />

            <p className="text-sm">
              {error}
            </p>
          </div>
        )}


        {/* LOADING */}
        {loading && (
          <div
            className="
              flex
              min-h-64
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-200
              bg-white
            "
          >
            <div className="text-center">
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
                Loading patient EHR...
              </p>
            </div>
          </div>
        )}


        {/* NO PATIENT SELECTED */}
        {!loading
          && !history
          && !error
          && canSearchPatients
          && (
            <div
              className="
                flex
                min-h-64
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
              <div className="text-center">
                <UserRound
                  className={
                  isDoctor
                    ? `
                    mx-auto
                    h-10
                    w-10
                    text-blue-500
                  `
                    : `
                    mx-auto
                    h-10
                    w-10
                    text-blue-500
                  `
                }
                />

                <h2
                  className="
                    mt-4
                    font-bold
                  "
                >
                  Select a patient
                </h2>

                <p
                  className="
                    mt-2
                    max-w-lg
                    text-sm
                    text-slate-500
                  "
                >
                  Select a patient from My EHR Patients
                  or search a registered patient above.
                </p>
              </div>
            </div>
          )
        }


        {/* EHR */}
        {!loading
          && history
          && (
            <>
              {/* PATIENT SUMMARY */}
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
                    gap-4
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                  "
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
                    ? `
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-2xl
                        bg-blue-50
                        text-blue-600
                      `
                    : `
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-2xl
                        bg-blue-50
                        text-blue-600
                      `
                }
                    >
                      {activePatient?.picture
                        ? (
                          <img
                            src={activePatient.picture}
                            alt=""
                            className="
                              h-full
                              w-full
                              object-cover
                            "
                          />
                        )
                        : (
                          <UserRound
                            className="
                              h-6
                              w-6
                            "
                          />
                        )
                      }
                    </div>


                    <div>
                      <p
                        className={
                  isDoctor
                    ? `
                          text-xs
                          font-semibold
                          uppercase
                          text-blue-500
                        `
                    : `
                          text-xs
                          font-semibold
                          uppercase
                          text-blue-500
                        `
                }
                      >
                        Patient EHR
                      </p>

                      <h2
                        className="
                          mt-1
                          text-lg
                          font-bold
                          text-slate-900
                        "
                      >
                        {activePatient?.fullName
                          || "Patient"
                        }
                      </h2>

                      <p
                        className="
                          mt-1
                          break-all
                          text-xs
                          text-slate-500
                        "
                      >
                        Patient ID:{" "}
                        {history.patientId}
                      </p>


                      {isDoctor && (
                        <Link
                          href={
                            selectedPatientCreateHref
                          }
                          className={
                  isDoctor
                    ? `
                            mt-3
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-blue-200
                            bg-blue-50
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-blue-700
                            transition
                            hover:border-blue-300
                            hover:bg-blue-100
                          `
                    : `
                            mt-3
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-blue-200
                            bg-blue-50
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-blue-700
                            transition
                            hover:border-blue-300
                            hover:bg-blue-100
                          `
                }
                        >
                          <Plus className="h-3.5 w-3.5" />

                          Add Record for This Patient
                        </Link>
                      )}
                    </div>
                  </div>


                  <div
                    className="
                      grid
                      grid-cols-3
                      gap-3
                    "
                  >
                    <div
                      className={
                  isDoctor
                    ? `
                        rounded-xl
                        bg-blue-50
                        px-4
                        py-3
                        text-center
                      `
                    : `
                        rounded-xl
                        bg-blue-50
                        px-4
                        py-3
                        text-center
                      `
                }
                    >
                      <p
                        className={
                  isDoctor
                    ? `
                          text-xl
                          font-bold
                          text-blue-700
                        `
                    : `
                          text-xl
                          font-bold
                          text-blue-700
                        `
                }
                      >
                        {history.medicalRecords.length}
                      </p>

                      <p
                        className={
                  isDoctor
                    ? `
                          text-[11px]
                          text-blue-600
                        `
                    : `
                          text-[11px]
                          text-blue-600
                        `
                }
                      >
                        Records
                      </p>
                    </div>

                    <div
                      className="
                        rounded-xl
                        bg-indigo-50
                        px-4
                        py-3
                        text-center
                      "
                    >
                      <p
                        className="
                          text-xl
                          font-bold
                          text-indigo-700
                        "
                      >
                        {history.diagnoses.length}
                      </p>

                      <p
                        className="
                          text-[11px]
                          text-indigo-600
                        "
                      >
                        Diagnoses
                      </p>
                    </div>

                    <div
                      className="
                        rounded-xl
                        bg-emerald-50
                        px-4
                        py-3
                        text-center
                      "
                    >
                      <p
                        className="
                          text-xl
                          font-bold
                          text-emerald-700
                        "
                      >
                        {history.treatments.length}
                      </p>

                      <p
                        className="
                          text-[11px]
                          text-emerald-600
                        "
                      >
                        Treatments
                      </p>
                    </div>
                  </div>
                </div>
              </section>


              {/* TABS */}
              <section
                className="
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-2
                "
              >
                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  <button
                    type="button"
                    onClick={
                      () =>
                        setActiveTab(
                          "history"
                        )
                    }
                    className={
                  isDoctor
                    ? `
                      rounded-xl
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      ${
                        activeTab
                        === "history"
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      }
                    `
                    : `
                      rounded-xl
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      ${
                        activeTab
                        === "history"
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      }
                    `
                }
                  >
                    Medical History
                  </button>

                  <button
                    type="button"
                    onClick={
                      () =>
                        setActiveTab(
                          "notes"
                        )
                    }
                    className={
                  isDoctor
                    ? `
                      rounded-xl
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      ${
                        activeTab
                        === "notes"
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      }
                    `
                    : `
                      rounded-xl
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      ${
                        activeTab
                        === "notes"
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      }
                    `
                }
                  >
                    Consultation Notes
                  </button>

                  <button
                    type="button"
                    onClick={
                      () =>
                        setActiveTab(
                          "documents"
                        )
                    }
                    className={
                  isDoctor
                    ? `
                      rounded-xl
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      ${
                        activeTab
                        === "documents"
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      }
                    `
                    : `
                      rounded-xl
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      ${
                        activeTab
                        === "documents"
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      }
                    `
                }
                  >
                    Documents
                  </button>
                </div>
              </section>


              {/* HISTORY */}
              {activeTab
                === "history"
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
                    <h2
                      className="
                        text-lg
                        font-bold
                      "
                    >
                      Medical History Timeline
                    </h2>


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
                          No medical records available.
                        </div>
                      )
                      : (
                        <div
                          className="
                            mt-5
                            space-y-4
                          "
                        >
                          {medicalRecords.map(
                            (
                              record:
                              MedicalRecord
                            ) => {
                              const diagnoses =
                                getDiagnosesForRecord(
                                  record.id
                                );

                              const treatments =
                                getTreatmentsForRecord(
                                  record.id
                                );


                              return (
                                <article
                                  key={record.id}
                                  className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    p-5
                                  "
                                >
                                  <div
                                    className="
                                      flex
                                      flex-col
                                      gap-4
                                      lg:flex-row
                                      lg:justify-between
                                    "
                                  >
                                    <div className="flex-1">
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
                                            text-xs
                                            font-semibold
                                            text-blue-700
                                          `
                    : `
                                            rounded-full
                                            bg-blue-50
                                            px-2.5
                                            py-1
                                            text-xs
                                            font-semibold
                                            text-blue-700
                                          `
                }
                                        >
                                          {record.recordType}
                                        </span>
                                      </div>


                                      <h3
                                        className="
                                          mt-3
                                          text-lg
                                          font-bold
                                          text-slate-900
                                        "
                                      >
                                        {record.diagnosis}
                                      </h3>


                                      <p
                                        className="
                                          mt-2
                                          text-sm
                                          leading-6
                                          text-slate-600
                                        "
                                      >
                                        {record.clinicalSummary}
                                      </p>


                                      <p
                                        className="
                                          mt-3
                                          text-xs
                                          text-slate-500
                                        "
                                      >
                                        {record.doctorName}
                                        {" • "}
                                        {record.hospitalName}
                                      </p>


                                      {(diagnoses.length > 0
                                        || treatments.length > 0)
                                        && (
                                          <div
                                            className="
                                              mt-4
                                              flex
                                              flex-wrap
                                              gap-2
                                            "
                                          >
                                            {diagnoses.map(
                                              (
                                                item
                                              ) => (
                                                <span
                                                  key={item.id}
                                                  className="
                                                    rounded-full
                                                    bg-indigo-50
                                                    px-2.5
                                                    py-1
                                                    text-xs
                                                    text-indigo-700
                                                  "
                                                >
                                                  {item.diagnosisName}
                                                </span>
                                              )
                                            )}

                                            {treatments.map(
                                              (
                                                item
                                              ) => (
                                                <span
                                                  key={item.id}
                                                  className="
                                                    rounded-full
                                                    bg-emerald-50
                                                    px-2.5
                                                    py-1
                                                    text-xs
                                                    text-emerald-700
                                                  "
                                                >
                                                  {item.treatmentType}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        )
                                      }
                                    </div>


                                    <div
                                      className="
                                        shrink-0
                                        lg:w-40
                                      "
                                    >
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
                                          w-full
                                          items-center
                                          justify-center
                                          rounded-xl
                                          bg-blue-600
                                          px-4
                                          py-2.5
                                          text-sm
                                          font-semibold
                                          text-white
                                          hover:bg-blue-700
                                        `
                    : `
                                          inline-flex
                                          w-full
                                          items-center
                                          justify-center
                                          rounded-xl
                                          bg-blue-600
                                          px-4
                                          py-2.5
                                          text-sm
                                          font-semibold
                                          text-white
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


              {/* CONSULTATION NOTES */}
              {activeTab
                === "notes"
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
                    <h2
                      className="
                        text-lg
                        font-bold
                      "
                    >
                      Consultation Notes
                    </h2>


                    {consultationRecords.length === 0
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
                          No consultation notes available.
                        </div>
                      )
                      : (
                        <div
                          className="
                            mt-5
                            space-y-3
                          "
                        >
                          {consultationRecords.map(
                            (
                              record
                            ) => (
                              <article
                                key={record.id}
                                className="
                                  rounded-2xl
                                  border
                                  border-slate-200
                                  bg-slate-50/60
                                  p-4
                                "
                              >
                                <div
                                  className="
                                    flex
                                    flex-col
                                    gap-2
                                    sm:flex-row
                                    sm:items-start
                                    sm:justify-between
                                  "
                                >
                                  <div>
                                    <h3
                                      className="
                                        font-bold
                                      "
                                    >
                                      {record.diagnosis}
                                    </h3>

                                    <p
                                      className="
                                        mt-1
                                        text-xs
                                        text-slate-500
                                      "
                                    >
                                      {formatDate(
                                        record.visitDate
                                      )}
                                      {" • "}
                                      {record.doctorName}
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
                                      text-xs
                                      font-semibold
                                      text-blue-600
                                    `
                    : `
                                      text-xs
                                      font-semibold
                                      text-blue-600
                                    `
                }
                                  >
                                    View Record Details
                                  </Link>
                                </div>


                                <p
                                  className="
                                    mt-4
                                    whitespace-pre-wrap
                                    text-sm
                                    leading-6
                                    text-slate-700
                                  "
                                >
                                  {record.consultationNotes}
                                </p>
                              </article>
                            )
                          )}
                        </div>
                      )
                    }
                  </section>
                )
              }


              {/* DOCUMENTS */}
              {activeTab
                === "documents"
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
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                      "
                    >
                      <div>
                        <h2
                          className="
                            text-lg
                            font-bold
                          "
                        >
                          Medical Documents
                        </h2>

                        <p
                          className="
                            mt-1
                            text-sm
                            text-slate-500
                          "
                        >
                          Active documents linked
                          to this patient's EHR.
                        </p>
                      </div>


                      <Link
                        href={documentsHref}
                        className={
                  isDoctor
                    ? `
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          bg-blue-600
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          text-white
                        `
                    : `
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          bg-blue-600
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          text-white
                        `
                }
                      >
                        <FolderOpen className="h-4 w-4" />

                        Manage Documents
                      </Link>
                    </div>


                    {documents.length === 0
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
                          No medical documents available.
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
                          {documents.map(
                            (
                              document:
                              MedicalDocument
                            ) => (
                              <article
                                key={document.id}
                                className="
                                  rounded-2xl
                                  border
                                  border-slate-200
                                  p-4
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

                                <h3
                                  className="
                                    mt-3
                                    truncate
                                    text-sm
                                    font-bold
                                  "
                                >
                                  {document.fileName}
                                </h3>

                                <p
                                  className={
                  isDoctor
                    ? `
                                    mt-1
                                    text-xs
                                    text-blue-600
                                  `
                    : `
                                    mt-1
                                    text-xs
                                    text-blue-600
                                  `
                }
                                >
                                  {document.documentType}
                                </p>


                                <div
                                  className="
                                    mt-3
                                    flex
                                    justify-between
                                    text-[11px]
                                    text-slate-400
                                  "
                                >
                                  <span>
                                    Version{" "}
                                    {document.version}
                                  </span>

                                  <span>
                                    {formatFileSize(
                                      document.fileSize
                                    )}
                                  </span>
                                </div>


                                <a
                                  href={document.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={
                  isDoctor
                    ? `
                                    mt-4
                                    inline-flex
                                    rounded-lg
                                    bg-blue-600
                                    px-3
                                    py-2
                                    text-xs
                                    font-semibold
                                    text-white
                                  `
                    : `
                                    mt-4
                                    inline-flex
                                    rounded-lg
                                    bg-blue-600
                                    px-3
                                    py-2
                                    text-xs
                                    font-semibold
                                    text-white
                                  `
                }
                                >
                                  Open Document
                                </a>
                              </article>
                            )
                          )}
                        </div>
                      )
                    }
                  </section>
                )
              }
            </>
          )
        }
      </div>
    </DashboardLayout>
  );
}