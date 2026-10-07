"use client";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import {
  Activity,
  AlertCircle,
  Archive,
  ArrowLeft,
  Building2,
  CalendarDays,
  FileText,
  FolderOpen,
  Loader2,
  Pencil,
  Stethoscope,
  UserRound,
} from "lucide-react";

import DashboardLayout
  from "@/components/medical-records/MedicalRecordsShell";

import {
  getStoredUser,
  type AuthUser,
} from "@/lib/auth";

import {
  medicalRecordService,
} from "@/services/medicalRecordService";

import {
  ehrArchiveService,
} from "@/services/ehrArchiveService";

import type {
  Diagnosis,
  MedicalDocument,
  MedicalRecord,
  TreatmentRecord,
} from "@/types/medicalRecord";


interface MedicalRecordDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}


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
        + "to access this Medical Record."
      );
    }


    if (
      requestError
        .response
        ?.status === 404
    ) {

      return (
        "The requested Medical Record "
        + "was not found."
      );
    }
  }


  return (
    "Unable to complete the "
    + "Medical Record request."
  );
}


export default function MedicalRecordDetailsPage({
  params,
}: MedicalRecordDetailsPageProps) {

  const router =
    useRouter();


  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<AuthUser | null>(
      null
    );


  const [
    recordId,
    setRecordId,
  ] =
    useState("");


  const [
    record,
    setRecord,
  ] =
    useState<MedicalRecord | null>(
      null
    );


  const [
    diagnoses,
    setDiagnoses,
  ] =
    useState<Diagnosis[]>(
      []
    );


  const [
    treatments,
    setTreatments,
  ] =
    useState<TreatmentRecord[]>(
      []
    );


  const [
    documents,
    setDocuments,
  ] =
    useState<MedicalDocument[]>(
      []
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    archiving,
    setArchiving,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  /*
   * =========================================================
   * USER + ROUTE PARAM
   * =========================================================
   */
  useEffect(
    () => {

      setCurrentUser(
        getStoredUser()
      );


      void (
        async () => {

          const resolved =
            await params;


          setRecordId(
            resolved.id
          );
        }
      )();

    },
    [
      params,
    ]
  );


  /*
   * =========================================================
   * LOAD RECORD + RELATED DATA
   * =========================================================
   */
  useEffect(
    () => {

      if (!recordId) {
        return;
      }


      let cancelled =
        false;


      void (
        async () => {

          setLoading(
            true
          );

          setError(
            ""
          );


          try {

            const [
              recordResponse,
              diagnosisResponse,
              treatmentResponse,
              documentResponse,
            ] =
              await Promise.all(
                [
                  medicalRecordService
                    .getMedicalRecordById(
                      recordId
                    ),

                  medicalRecordService
                    .getDiagnosesByRecord(
                      recordId
                    ),

                  medicalRecordService
                    .getTreatmentsByRecord(
                      recordId
                    ),

                  medicalRecordService
                    .getDocumentsByRecord(
                      recordId
                    ),
                ]
              );


            if (cancelled) {
              return;
            }


            setRecord(
              recordResponse
            );

            setDiagnoses(
              diagnosisResponse
            );

            setTreatments(
              treatmentResponse
            );

            setDocuments(
              documentResponse
            );


          } catch (
            requestError
          ) {

            if (!cancelled) {

              setError(
                getErrorMessage(
                  requestError
                )
              );
            }


          } finally {

            if (!cancelled) {

              setLoading(
                false
              );
            }
          }
        }
      )();


      return () => {
        cancelled = true;
      };

    },
    [
      recordId,
    ]
  );


  /*
   * Doctor workspace colour theme.
   *
   * Only DOCTOR users receive the teal/green Medical Records
   * appearance. Patient/Admin/Super Admin keep the existing
   * blue/indigo appearance.
   */
  const isDoctor =
    currentUser?.role
    === "DOCTOR";


  /*
   * Doctor can modify/archive only
   * a record created by that doctor.
   */
  const canEdit =
    Boolean(
      record
      && isDoctor
      && record.doctorId
        === currentUser?.id
    );


  const canOpenArchiveManagement =
    currentUser?.role === "ADMIN"
    || currentUser?.role === "SUPER_ADMIN";


  /*
   * =========================================================
   * LINKS
   * =========================================================
   */
  const backHref =
    record
      ? (
        `/medical-records?patientId=${
          encodeURIComponent(
            record.patientId
          )
        }`
      )
      : "/medical-records";


  const historyHref =
    record
      ? (
        `/medical-records/history?patientId=${
          encodeURIComponent(
            record.patientId
          )
        }`
      )
      : "/medical-records/history";


  /*
   * recordId is also passed.
   *
   * This keeps the document upload context
   * tied to this exact Medical Record.
   */
  const documentsHref =
    record
      ? (
        `/medical-records/documents?patientId=${
          encodeURIComponent(
            record.patientId
          )
        }&recordId=${
          encodeURIComponent(
            record.id
          )
        }`
      )
      : "/medical-records/documents";


  const editHref =
    record
      ? (
        `/medical-records/${
          encodeURIComponent(
            record.id
          )
        }/edit`
      )
      : "#";


  const diagnosesHref =
    record
      ? (
        `/medical-records/${
          encodeURIComponent(
            record.id
          )
        }/diagnoses`
      )
      : "#";


  const treatmentsHref =
    record
      ? (
        `/medical-records/${
          encodeURIComponent(
            record.id
          )
        }/treatments`
      )
      : "#";


  /*
   * =========================================================
   * DOCTOR ARCHIVE
   * =========================================================
   */
  const handleArchiveRecord =
    async () => {

      if (
        !record
        || !canEdit
      ) {
        return;
      }


      const confirmed =
        window.confirm(
          "Archive this Medical Record?\n\n"
          + "It will be removed from the active patient EHR. "
          + "An Admin or Super Admin can restore it later."
        );


      if (!confirmed) {
        return;
      }


      setArchiving(
        true
      );

      setError(
        ""
      );


      try {

        await ehrArchiveService
          .archiveMedicalRecord(
            record.id
          );


        router.push(
          `/medical-records?patientId=${
            encodeURIComponent(
              record.patientId
            )
          }`
        );


        router.refresh();


      } catch (
        requestError
      ) {

        setError(
          getErrorMessage(
            requestError
          )
        );


      } finally {

        setArchiving(
          false
        );
      }
    };


  return (

    <DashboardLayout
      pageTitle="Medical Record Details"
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
            sm:flex-row
            sm:items-start
            sm:justify-between
          "
        >

          <div>

            <Link
              href={
                backHref
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
                hover:text-blue-700
              `
                : `
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-blue-600
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
              Medical Record Details
            </h1>


            <p
              className="
                mt-1
                text-sm
                text-slate-500
              "
            >
              Complete clinical information
              for this patient visit.
            </p>

          </div>


          {record && (

            <div
              className="
                flex
                flex-wrap
                gap-2
              "
            >

              {canEdit && (

                <Link
                  href={
                    editHref
                  }
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
                    hover:bg-blue-700
                  `
            }
                >
                  <Pencil
                    className="
                      h-4
                      w-4
                    "
                  />

                  Edit Record
                </Link>

              )}


              {canEdit && (

                <Link
                  href={
                    diagnosesHref
                  }
                  className={
              isDoctor
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
                    hover:bg-blue-100
                  `
                : `
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-indigo-200
                    bg-indigo-50
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-indigo-700
                    hover:bg-indigo-100
                  `
            }
                >
                  <Stethoscope
                    className="
                      h-4
                      w-4
                    "
                  />

                  Manage Diagnoses
                </Link>

              )}


              {canEdit && (

                <Link
                  href={
                    treatmentsHref
                  }
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-emerald-200
                    bg-emerald-50
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-emerald-700
                    hover:bg-emerald-100
                  "
                >
                  <Activity
                    className="
                      h-4
                      w-4
                    "
                  />

                  Manage Treatments
                </Link>

              )}


              {canEdit && (

                <button
                  type="button"
                  onClick={
                    () =>
                      void handleArchiveRecord()
                  }
                  disabled={
                    archiving
                  }
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
                    hover:bg-amber-100
                    disabled:opacity-50
                  "
                >

                  {archiving
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
                      <Archive
                        className="
                          h-4
                          w-4
                        "
                      />
                    )
                  }

                  {archiving
                    ? "Archiving..."
                    : "Archive Record"
                  }

                </button>

              )}


              <Link
                href={
                  historyHref
                }
                className={
              isDoctor
                ? `
                  inline-flex
                  items-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-700
                  hover:border-blue-300
                  hover:text-blue-600
                `
                : `
                  inline-flex
                  items-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-700
                  hover:border-blue-300
                  hover:text-blue-600
                `
            }
              >
                Full History
              </Link>


              <Link
                href={
                  documentsHref
                }
                className={
              isDoctor
                ? `
                  inline-flex
                  items-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-700
                  hover:border-blue-300
                  hover:text-blue-600
                `
                : `
                  inline-flex
                  items-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-700
                  hover:border-blue-300
                  hover:text-blue-600
                `
            }
              >
                Documents
              </Link>


              {canOpenArchiveManagement && (

                <Link
                  href="/medical-records/archived"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-amber-200
                    bg-white
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-amber-700
                    hover:bg-amber-50
                  "
                >
                  <Archive
                    className="
                      h-4
                      w-4
                    "
                  />

                  Archived Records
                </Link>

              )}

            </div>

          )}

        </div>


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
            <AlertCircle
              className="
                mt-0.5
                h-5
                w-5
                shrink-0
              "
            />

            <p
              className="
                text-sm
              "
            >
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
            <Loader2
              className={
              isDoctor
                ? `
                h-8
                w-8
                animate-spin
                text-blue-600
              `
                : `
                h-8
                w-8
                animate-spin
                text-blue-600
              `
            }
            />
          </div>

        )}


        {!loading
          && record
          && (
            <>

              {/* MAIN RECORD */}
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
                    gap-5
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
                        gap-2
                      "
                    >
                      <span
                        className={
              isDoctor
                ? `
                          rounded-full
                          bg-blue-50
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          text-blue-700
                        `
                : `
                          rounded-full
                          bg-blue-50
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          text-blue-700
                        `
            }
                      >
                        {record.recordType}
                      </span>

                      <span
                        className="
                          rounded-full
                          bg-emerald-50
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          text-emerald-700
                        "
                      >
                        {record.status}
                      </span>

                      <span
                        className="
                          rounded-full
                          bg-slate-100
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          text-slate-600
                        "
                      >
                        Version{" "}
                        {record.version}
                      </span>
                    </div>


                    <h2
                      className="
                        mt-5
                        text-xl
                        font-bold
                        text-slate-900
                      "
                    >
                      {record.diagnosis}
                    </h2>


                    <p
                      className="
                        mt-2
                        whitespace-pre-wrap
                        text-sm
                        leading-6
                        text-slate-600
                      "
                    >
                      {record.clinicalSummary}
                    </p>

                  </div>


                  <div
                    className="
                      grid
                      min-w-72
                      gap-3
                      sm:grid-cols-2
                      lg:grid-cols-1
                    "
                  >

                    <div
                      className="
                        rounded-xl
                        bg-slate-50
                        p-4
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          text-xs
                          text-slate-400
                        "
                      >
                        <CalendarDays
                          className={
              isDoctor
                ? `
                            h-4
                            w-4
                            text-blue-600
                          `
                : `
                            h-4
                            w-4
                            text-blue-600
                          `
            }
                        />

                        Visit Date
                      </div>

                      <p
                        className="
                          mt-1
                          font-semibold
                          text-slate-800
                        "
                      >
                        {formatDate(
                          record.visitDate
                        )}
                      </p>
                    </div>


                    <div
                      className="
                        rounded-xl
                        bg-slate-50
                        p-4
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          text-xs
                          text-slate-400
                        "
                      >
                        <Building2
                          className={
              isDoctor
                ? `
                            h-4
                            w-4
                            text-blue-600
                          `
                : `
                            h-4
                            w-4
                            text-blue-600
                          `
            }
                        />

                        Hospital
                      </div>

                      <p
                        className="
                          mt-1
                          font-semibold
                          text-slate-800
                        "
                      >
                        {record.hospitalName}
                      </p>
                    </div>

                  </div>

                </div>

              </section>


              {/* PATIENT / DOCTOR */}
              <div
                className="
                  grid
                  gap-5
                  lg:grid-cols-2
                "
              >

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
                      gap-3
                    "
                  >
                    <UserRound
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

                    <div>
                      <p
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-slate-400
                        "
                      >
                        Patient ID
                      </p>

                      <p
                        className="
                          mt-1
                          break-all
                          font-semibold
                          text-slate-800
                        "
                      >
                        {record.patientId}
                      </p>
                    </div>
                  </div>
                </section>


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
                      gap-3
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

                    <div>
                      <p
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-slate-400
                        "
                      >
                        Attending Doctor
                      </p>

                      <p
                        className="
                          mt-1
                          font-semibold
                          text-slate-800
                        "
                      >
                        {record.doctorName}
                      </p>
                    </div>
                  </div>
                </section>

              </div>


              {/* DIAGNOSES */}
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
                      Diagnoses
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
                      {diagnoses.length}
                    </span>
                  </div>


                  {canEdit && (

                    <Link
                      href={
                        diagnosesHref
                      }
                      className={
              isDoctor
                ? `
                        rounded-xl
                        border
                        border-blue-200
                        bg-blue-50
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-blue-700
                        hover:bg-blue-100
                      `
                : `
                        rounded-xl
                        border
                        border-indigo-200
                        bg-indigo-50
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-indigo-700
                        hover:bg-indigo-100
                      `
            }
                    >
                      Manage Diagnoses
                    </Link>

                  )}

                </div>


                {diagnoses.length === 0
                  ? (
                    <p
                      className="
                        mt-4
                        text-sm
                        text-slate-500
                      "
                    >
                      No additional diagnoses
                      linked to this record.
                    </p>
                  )
                  : (
                    <div
                      className="
                        mt-4
                        grid
                        gap-3
                        md:grid-cols-2
                      "
                    >

                      {diagnoses.map(
                        (
                          diagnosis
                        ) => (

                          <div
                            key={
                              diagnosis.id
                            }
                            className="
                              rounded-xl
                              border
                              border-slate-200
                              bg-slate-50
                              p-4
                            "
                          >

                            <p
                              className="
                                font-semibold
                                text-slate-900
                              "
                            >
                              {
                                diagnosis
                                  .diagnosisName
                              }
                            </p>


                            {diagnosis
                              .description
                              && (
                                <p
                                  className="
                                    mt-1
                                    text-sm
                                    text-slate-500
                                  "
                                >
                                  {
                                    diagnosis
                                      .description
                                  }
                                </p>
                              )
                            }


                            <p
                              className="
                                mt-2
                                text-xs
                                text-slate-400
                              "
                            >
                              {formatDate(
                                diagnosis
                                  .diagnosedDate
                              )}

                              {diagnosis
                                .severity
                                ? (
                                  ` · ${
                                    diagnosis
                                      .severity
                                  }`
                                )
                                : ""
                              }
                            </p>

                          </div>
                        )
                      )}

                    </div>
                  )
                }

              </section>


              {/* TREATMENTS */}
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
                      Treatment Records
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
                      {treatments.length}
                    </span>
                  </div>


                  {canEdit && (

                    <Link
                      href={
                        treatmentsHref
                      }
                      className="
                        rounded-xl
                        border
                        border-emerald-200
                        bg-emerald-50
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-emerald-700
                        hover:bg-emerald-100
                      "
                    >
                      Manage Treatments
                    </Link>

                  )}

                </div>


                {treatments.length === 0
                  ? (
                    <p
                      className="
                        mt-4
                        text-sm
                        text-slate-500
                      "
                    >
                      No linked treatment records.
                    </p>
                  )
                  : (
                    <div
                      className="
                        mt-4
                        grid
                        gap-3
                        md:grid-cols-2
                      "
                    >

                      {treatments.map(
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
                              border-slate-200
                              bg-slate-50
                              p-4
                            "
                          >

                            <p
                              className="
                                font-semibold
                                text-slate-900
                              "
                            >
                              {
                                treatment
                                  .treatmentType
                              }
                            </p>


                            {treatment
                              .description
                              && (
                                <p
                                  className="
                                    mt-1
                                    text-sm
                                    text-slate-500
                                  "
                                >
                                  {
                                    treatment
                                      .description
                                  }
                                </p>
                              )
                            }


                            <p
                              className="
                                mt-2
                                text-xs
                                text-slate-400
                              "
                            >
                              {formatDate(
                                treatment.startDate
                              )}

                              {treatment.endDate
                                ? (
                                  ` → ${
                                    formatDate(
                                      treatment.endDate
                                    )
                                  }`
                                )
                                : ""
                              }

                              {treatment.status
                                ? (
                                  ` · ${
                                    treatment.status
                                  }`
                                )
                                : ""
                              }
                            </p>

                          </div>
                        )
                      )}

                    </div>
                  )
                }

              </section>


              {/* CONSULTATION NOTES */}
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

                  <h2
                    className="
                      text-lg
                      font-bold
                      text-slate-900
                    "
                  >
                    Consultation Notes
                  </h2>
                </div>


                <div
                  className="
                    mt-4
                    rounded-xl
                    bg-slate-50
                    p-4
                    text-sm
                    leading-6
                    text-slate-700
                  "
                >
                  {
                    record.consultationNotes
                    || "No consultation notes recorded."
                  }
                </div>

              </section>


              {/* LINKED DOCUMENTS */}
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

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <FolderOpen
                      className="
                        h-5
                        w-5
                        text-amber-600
                      "
                    />

                    <h2
                      className="
                        text-lg
                        font-bold
                        text-slate-900
                      "
                    >
                      Linked Documents
                    </h2>

                    <span
                      className="
                        rounded-full
                        bg-amber-50
                        px-2.5
                        py-1
                        text-xs
                        font-bold
                        text-amber-700
                      "
                    >
                      {documents.length}
                    </span>
                  </div>


                  <Link
                    href={
                      documentsHref
                    }
                    className={
              isDoctor
                ? `
                      text-sm
                      font-semibold
                      text-blue-600
                      hover:text-blue-700
                    `
                : `
                      text-sm
                      font-semibold
                      text-blue-600
                      hover:text-blue-700
                    `
            }
                  >
                    {canEdit
                      ? "Upload / View documents"
                      : "View all documents"
                    }
                  </Link>

                </div>


                {documents.length === 0
                  ? (
                    <p
                      className="
                        mt-4
                        text-sm
                        text-slate-500
                      "
                    >
                      No active documents linked
                      to this record.
                    </p>
                  )
                  : (
                    <div
                      className="
                        mt-4
                        grid
                        gap-3
                        md:grid-cols-2
                        xl:grid-cols-3
                      "
                    >

                      {documents.map(
                        (
                          document
                        ) => (

                          <article
                            key={
                              document.id
                            }
                            className="
                              rounded-xl
                              border
                              border-slate-200
                              bg-slate-50
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

                              <span
                                className="
                                  rounded-full
                                  bg-emerald-50
                                  px-2
                                  py-1
                                  text-[11px]
                                  font-semibold
                                  text-emerald-700
                                "
                              >
                                {document.status}
                              </span>
                            </div>


                            <h3
                              title={
                                document.fileName
                              }
                              className="
                                mt-3
                                truncate
                                text-sm
                                font-bold
                                text-slate-900
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
                                font-semibold
                                text-blue-600
                              `
                : `
                                mt-1
                                text-xs
                                font-semibold
                                text-blue-600
                              `
            }
                            >
                              {document.documentType}
                            </p>


                            <p
                              className="
                                mt-3
                                text-xs
                                text-slate-400
                              "
                            >
                              Version{" "}
                              {document.version}
                              {" · "}
                              {formatFileSize(
                                document.fileSize
                              )}
                            </p>


                            <a
                              href={
                                document.fileUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                              className={
              isDoctor
                ? `
                                mt-3
                                inline-flex
                                rounded-lg
                                bg-blue-600
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-white
                                hover:bg-blue-700
                              `
                : `
                                mt-3
                                inline-flex
                                rounded-lg
                                bg-blue-600
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-white
                                hover:bg-blue-700
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

            </>
          )
        }

      </div>

    </DashboardLayout>
  );
}