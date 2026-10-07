"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Archive,
  ArrowLeft,
  CalendarDays,
  FileText,
  Loader2,
  RotateCcw,
  Stethoscope,
  Trash2,
  UserRound,
} from "lucide-react";

import DashboardLayout from "@/components/medical-records/MedicalRecordsShell";

import {
  getStoredUser,
  type AuthUser,
} from "@/lib/auth";

import {
  ehrArchiveService,
} from "@/services/ehrArchiveService";

import type {
  MedicalDocument,
  MedicalRecord,
} from "@/types/medicalRecord";


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
        + "to manage archived EHR data."
      );
    }


    if (
      requestError
        .response
        ?.status === 404
    ) {

      return (
        "The requested archived EHR resource "
        + "was not found."
      );
    }
  }


  return (
    "Unable to complete the archived EHR request."
  );
}


export default function ArchivedEhrPage() {

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<AuthUser | null>(
      null
    );


  const [
    records,
    setRecords,
  ] =
    useState<MedicalRecord[]>(
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
    filterText,
    setFilterText,
  ] =
    useState("");


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    actionLoading,
    setActionLoading,
  ] =
    useState<string | null>(
      null
    );


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    success,
    setSuccess,
  ] =
    useState("");


  const isAdmin =
    currentUser?.role === "ADMIN";


  const isSuperAdmin =
    currentUser?.role === "SUPER_ADMIN";


  const canManageArchived =
    isAdmin
    || isSuperAdmin;


  const filteredRecords =
    useMemo(
      () => {

        const query =
          filterText
            .trim()
            .toLowerCase();


        if (!query) {
          return records;
        }


        return records.filter(
          (
            record
          ) => {

            return (
              record.id
                .toLowerCase()
                .includes(query)

              || record.patientId
                .toLowerCase()
                .includes(query)

              || record.doctorName
                .toLowerCase()
                .includes(query)

              || record.diagnosis
                .toLowerCase()
                .includes(query)

              || record.hospitalName
                .toLowerCase()
                .includes(query)

              || record.recordType
                .toLowerCase()
                .includes(query)
            );
          }
        );

      },
      [
        records,
        filterText,
      ]
    );


  const filteredDocuments =
    useMemo(
      () => {

        const query =
          filterText
            .trim()
            .toLowerCase();


        if (!query) {
          return documents;
        }


        return documents.filter(
          (
            document
          ) => {

            return (
              document.id
                .toLowerCase()
                .includes(query)

              || document.patientId
                .toLowerCase()
                .includes(query)

              || document.medicalRecordId
                .toLowerCase()
                .includes(query)

              || document.fileName
                .toLowerCase()
                .includes(query)

              || document.documentType
                .toLowerCase()
                .includes(query)
            );
          }
        );

      },
      [
        documents,
        filterText,
      ]
    );


  const loadArchivedData =
    async () => {

      setLoading(
        true
      );

      setError(
        ""
      );


      try {

        const [
          archivedRecords,
          archivedDocuments,
        ] =
          await Promise.all(
            [
              ehrArchiveService
                .getArchivedMedicalRecords(),

              ehrArchiveService
                .getArchivedDocuments(),
            ]
          );


        setRecords(
          archivedRecords ?? []
        );


        setDocuments(
          archivedDocuments ?? []
        );


      } catch (
        requestError
      ) {

        setRecords(
          []
        );

        setDocuments(
          []
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


  useEffect(
    () => {

      const storedUser =
        getStoredUser();


      setCurrentUser(
        storedUser
      );


      if (
        !storedUser
        || (
          storedUser.role !== "ADMIN"
          && storedUser.role !== "SUPER_ADMIN"
        )
      ) {

        setLoading(
          false
        );


        setError(
          "Only Admin or Super Admin can access archived EHR data."
        );


        return;
      }


      void loadArchivedData();

      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    []
  );


  const handleRestoreRecord =
    async (
      record:
      MedicalRecord
    ) => {

      const confirmed =
        window.confirm(
          "Restore this Medical Record to the active patient EHR?"
        );


      if (!confirmed) {
        return;
      }


      setActionLoading(
        `record-restore-${record.id}`
      );

      setError("");
      setSuccess("");


      try {

        await ehrArchiveService
          .restoreMedicalRecord(
            record.id
          );


        setRecords(
          (
            current
          ) =>
            current.filter(
              (
                item
              ) =>
                item.id
                !== record.id
            )
        );


        setSuccess(
          "Medical Record restored successfully."
        );


      } catch (
        requestError
      ) {

        setError(
          getErrorMessage(
            requestError
          )
        );


      } finally {

        setActionLoading(
          null
        );
      }
    };


  const handleDeleteRecord =
    async (
      record:
      MedicalRecord
    ) => {

      if (!isSuperAdmin) {
        return;
      }


      const confirmed =
        window.confirm(
          "Permanently delete this archived Medical Record?\n\n"
          + "Linked diagnoses, treatments and documents may also be removed.\n\n"
          + "This action cannot be undone."
        );


      if (!confirmed) {
        return;
      }


      setActionLoading(
        `record-delete-${record.id}`
      );

      setError("");
      setSuccess("");


      try {

        await ehrArchiveService
          .permanentlyDeleteMedicalRecord(
            record.id
          );


        setRecords(
          (
            current
          ) =>
            current.filter(
              (
                item
              ) =>
                item.id
                !== record.id
            )
        );


        setDocuments(
          (
            current
          ) =>
            current.filter(
              (
                document
              ) =>
                document.medicalRecordId
                !== record.id
            )
        );


        setSuccess(
          "Archived Medical Record permanently deleted."
        );


      } catch (
        requestError
      ) {

        setError(
          getErrorMessage(
            requestError
          )
        );


      } finally {

        setActionLoading(
          null
        );
      }
    };


  const handleRestoreDocument =
    async (
      document:
      MedicalDocument
    ) => {

      const confirmed =
        window.confirm(
          `Restore "${document.fileName}" to active documents?`
        );


      if (!confirmed) {
        return;
      }


      setActionLoading(
        `document-restore-${document.id}`
      );

      setError("");
      setSuccess("");


      try {

        await ehrArchiveService
          .restoreDocument(
            document.id
          );


        setDocuments(
          (
            current
          ) =>
            current.filter(
              (
                item
              ) =>
                item.id
                !== document.id
            )
        );


        setSuccess(
          "Medical document restored successfully."
        );


      } catch (
        requestError
      ) {

        setError(
          getErrorMessage(
            requestError
          )
        );


      } finally {

        setActionLoading(
          null
        );
      }
    };


  const handleDeleteDocument =
    async (
      document:
      MedicalDocument
    ) => {

      if (!isSuperAdmin) {
        return;
      }


      const confirmed =
        window.confirm(
          `Permanently delete "${document.fileName}"?\n\n`
          + "This action cannot be undone."
        );


      if (!confirmed) {
        return;
      }


      setActionLoading(
        `document-delete-${document.id}`
      );

      setError("");
      setSuccess("");


      try {

        await ehrArchiveService
          .permanentlyDeleteDocument(
            document.id
          );


        setDocuments(
          (
            current
          ) =>
            current.filter(
              (
                item
              ) =>
                item.id
                !== document.id
            )
        );


        setSuccess(
          "Archived medical document permanently deleted."
        );


      } catch (
        requestError
      ) {

        setError(
          getErrorMessage(
            requestError
          )
        );


      } finally {

        setActionLoading(
          null
        );
      }
    };


  return (

    <DashboardLayout
      pageTitle="Archived EHR Data"
    >

      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          space-y-5
        "
      >

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
              href="/medical-records"
              className="
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-blue-600
                hover:text-blue-700
              "
            >
              <ArrowLeft
                className="
                  h-4
                  w-4
                "
              />

              Back to Medical Records
            </Link>


            <div
              className="
                mt-3
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-amber-100
                  text-amber-700
                "
              >
                <Archive
                  className="
                    h-5
                    w-5
                  "
                />
              </div>


              <div>

                <h1
                  className="
                    text-2xl
                    font-bold
                    text-slate-900
                  "
                >
                  Archived EHR Data
                </h1>


                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                  "
                >
                  Restore archived Medical Records and Medical Documents.
                  Super Admin can also permanently delete archived data.
                </p>

              </div>

            </div>

          </div>


          {canManageArchived && (

            <button
              type="button"
              onClick={
                () =>
                  void loadArchivedData()
              }
              disabled={
                loading
              }
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
                shadow-sm
                transition
                hover:border-blue-300
                hover:text-blue-600
                disabled:opacity-50
              "
            >
              {loading && (
                <Loader2
                  className="
                    h-4
                    w-4
                    animate-spin
                  "
                />
              )}

              Refresh
            </button>

          )}

        </div>


        {canManageArchived && (

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

            <label
              className="
                mb-2
                block
                text-xs
                font-bold
                uppercase
                tracking-wide
                text-slate-500
              "
            >
              Filter archived EHR data
            </label>


            <input
              type="text"
              value={
                filterText
              }
              onChange={
                (
                  event
                ) =>
                  setFilterText(
                    event.target.value
                  )
              }
              placeholder="Patient ID, doctor, diagnosis, file name or Medical Record ID"
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                px-4
                py-2.5
                text-sm
                outline-none
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
              "
            />

          </div>

        )}


        {success && (

          <div
            className="
              rounded-2xl
              border
              border-emerald-200
              bg-emerald-50
              p-4
              text-sm
              font-semibold
              text-emerald-700
            "
          >
            {success}
          </div>

        )}


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


        {loading
          ? (

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
                className="
                  h-8
                  w-8
                  animate-spin
                  text-blue-600
                "
              />
            </div>

          )
          : (
            <>

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
                        text-slate-900
                      "
                    >
                      Archived Medical Records
                    </h2>


                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-500
                      "
                    >
                      Medical Records removed from the active patient EHR.
                    </p>

                  </div>


                  <span
                    className="
                      rounded-xl
                      bg-amber-50
                      px-4
                      py-2
                      text-sm
                      font-bold
                      text-amber-700
                    "
                  >
                    {filteredRecords.length}
                  </span>

                </div>


                {filteredRecords.length === 0
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
                      No archived Medical Records found.
                    </div>

                  )
                  : (

                    <div
                      className="
                        mt-5
                        grid
                        gap-4
                        lg:grid-cols-2
                      "
                    >

                      {filteredRecords.map(
                        (
                          record
                        ) => (

                          <article
                            key={
                              record.id
                            }
                            className="
                              rounded-2xl
                              border
                              border-amber-200
                              bg-amber-50/30
                              p-5
                            "
                          >

                            <div
                              className="
                                flex
                                items-start
                                justify-between
                                gap-4
                              "
                            >

                              <div>

                                <div
                                  className="
                                    flex
                                    flex-wrap
                                    gap-2
                                  "
                                >

                                  <span
                                    className="
                                      rounded-full
                                      bg-amber-100
                                      px-2.5
                                      py-1
                                      text-[11px]
                                      font-bold
                                      text-amber-700
                                    "
                                  >
                                    ARCHIVED
                                  </span>


                                  <span
                                    className="
                                      rounded-full
                                      bg-blue-50
                                      px-2.5
                                      py-1
                                      text-[11px]
                                      font-semibold
                                      text-blue-700
                                    "
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
                                    mt-1
                                    line-clamp-3
                                    text-sm
                                    text-slate-500
                                  "
                                >
                                  {record.clinicalSummary}
                                </p>

                              </div>


                              <div
                                className="
                                  shrink-0
                                  rounded-xl
                                  bg-white
                                  px-3
                                  py-2
                                  text-right
                                "
                              >
                                <p
                                  className="
                                    text-[11px]
                                    font-semibold
                                    uppercase
                                    tracking-wide
                                    text-amber-600
                                  "
                                >
                                  Archived
                                </p>

                                <p
                                  className="
                                    mt-1
                                    text-xs
                                    font-semibold
                                    text-amber-800
                                  "
                                >
                                  {formatDate(
                                    record.archivedAt
                                  )}
                                </p>
                              </div>

                            </div>


                            <div
                              className="
                                mt-4
                                grid
                                gap-3
                                sm:grid-cols-2
                              "
                            >

                              <div
                                className="
                                  rounded-xl
                                  bg-white
                                  p-3
                                "
                              >
                                <div
                                  className="
                                    flex
                                    items-center
                                    gap-2
                                    text-xs
                                    font-semibold
                                    text-slate-500
                                  "
                                >
                                  <UserRound
                                    className="
                                      h-4
                                      w-4
                                    "
                                  />

                                  Patient ID
                                </div>

                                <p
                                  className="
                                    mt-1
                                    break-all
                                    text-sm
                                    font-semibold
                                    text-slate-800
                                  "
                                >
                                  {record.patientId}
                                </p>
                              </div>


                              <div
                                className="
                                  rounded-xl
                                  bg-white
                                  p-3
                                "
                              >
                                <div
                                  className="
                                    flex
                                    items-center
                                    gap-2
                                    text-xs
                                    font-semibold
                                    text-slate-500
                                  "
                                >
                                  <Stethoscope
                                    className="
                                      h-4
                                      w-4
                                    "
                                  />

                                  Doctor
                                </div>

                                <p
                                  className="
                                    mt-1
                                    text-sm
                                    font-semibold
                                    text-slate-800
                                  "
                                >
                                  {record.doctorName}
                                </p>
                              </div>


                              <div
                                className="
                                  rounded-xl
                                  bg-white
                                  p-3
                                "
                              >
                                <div
                                  className="
                                    flex
                                    items-center
                                    gap-2
                                    text-xs
                                    font-semibold
                                    text-slate-500
                                  "
                                >
                                  <CalendarDays
                                    className="
                                      h-4
                                      w-4
                                    "
                                  />

                                  Visit Date
                                </div>

                                <p
                                  className="
                                    mt-1
                                    text-sm
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
                                  bg-white
                                  p-3
                                "
                              >
                                <p
                                  className="
                                    text-xs
                                    font-semibold
                                    text-slate-500
                                  "
                                >
                                  Hospital
                                </p>

                                <p
                                  className="
                                    mt-1
                                    text-sm
                                    font-semibold
                                    text-slate-800
                                  "
                                >
                                  {record.hospitalName}
                                </p>
                              </div>

                            </div>


                            <div
                              className="
                                mt-4
                                flex
                                flex-wrap
                                gap-2
                                border-t
                                border-amber-200
                                pt-4
                              "
                            >

                              <button
                                type="button"
                                onClick={
                                  () =>
                                    void handleRestoreRecord(
                                      record
                                    )
                                }
                                disabled={
                                  actionLoading
                                  === `record-restore-${record.id}`
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
                                  disabled:opacity-50
                                "
                              >

                                {actionLoading
                                  === `record-restore-${record.id}`
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
                                    <RotateCcw
                                      className="
                                        h-4
                                        w-4
                                      "
                                    />
                                  )
                                }

                                Restore Record
                              </button>


                              {isSuperAdmin && (

                                <button
                                  type="button"
                                  onClick={
                                    () =>
                                      void handleDeleteRecord(
                                        record
                                      )
                                  }
                                  disabled={
                                    actionLoading
                                    === `record-delete-${record.id}`
                                  }
                                  className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-red-200
                                    bg-red-50
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-red-700
                                    hover:bg-red-100
                                    disabled:opacity-50
                                  "
                                >

                                  {actionLoading
                                    === `record-delete-${record.id}`
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
                                      <Trash2
                                        className="
                                          h-4
                                          w-4
                                        "
                                      />
                                    )
                                  }

                                  Permanent Delete
                                </button>

                              )}

                            </div>

                          </article>
                        )
                      )}

                    </div>
                  )
                }

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
                      Archived Medical Documents
                    </h2>


                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-500
                      "
                    >
                      Documents archived individually from patient EHR records.
                    </p>

                  </div>


                  <span
                    className="
                      rounded-xl
                      bg-amber-50
                      px-4
                      py-2
                      text-sm
                      font-bold
                      text-amber-700
                    "
                  >
                    {filteredDocuments.length}
                  </span>

                </div>


                {filteredDocuments.length === 0
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
                      No archived Medical Documents found.
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

                      {filteredDocuments.map(
                        (
                          document
                        ) => (

                          <article
                            key={
                              document.id
                            }
                            className="
                              flex
                              min-h-64
                              flex-col
                              rounded-2xl
                              border
                              border-amber-200
                              bg-amber-50/30
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

                              <div
                                className="
                                  flex
                                  h-11
                                  w-11
                                  items-center
                                  justify-center
                                  rounded-xl
                                  bg-amber-100
                                  text-amber-700
                                "
                              >
                                <FileText
                                  className="
                                    h-5
                                    w-5
                                  "
                                />
                              </div>


                              <span
                                className="
                                  rounded-full
                                  bg-amber-100
                                  px-2.5
                                  py-1
                                  text-[11px]
                                  font-bold
                                  text-amber-700
                                "
                              >
                                ARCHIVED
                              </span>

                            </div>


                            <div
                              className="
                                mt-4
                                flex-1
                              "
                            >

                              <h3
                                title={
                                  document.fileName
                                }
                                className="
                                  truncate
                                  text-sm
                                  font-bold
                                  text-slate-900
                                "
                              >
                                {document.fileName}
                              </h3>


                              <p
                                className="
                                  mt-1
                                  text-xs
                                  font-semibold
                                  text-blue-600
                                "
                              >
                                {document.documentType}
                              </p>


                              {document
                                .description
                                && (
                                  <p
                                    className="
                                      mt-2
                                      line-clamp-2
                                      text-xs
                                      leading-5
                                      text-slate-500
                                    "
                                  >
                                    {document.description}
                                  </p>
                                )
                              }


                              <p
                                className="
                                  mt-3
                                  break-all
                                  text-[11px]
                                  text-slate-400
                                "
                              >
                                Patient:{" "}
                                {document.patientId}
                              </p>


                              <p
                                className="
                                  mt-1
                                  break-all
                                  text-[11px]
                                  text-slate-400
                                "
                              >
                                Medical Record:{" "}
                                {document.medicalRecordId}
                              </p>

                            </div>


                            <div
                              className="
                                mt-4
                                border-t
                                border-amber-200
                                pt-3
                              "
                            >

                              <div
                                className="
                                  flex
                                  justify-between
                                  gap-3
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


                              <p
                                className="
                                  mt-1
                                  text-[11px]
                                  text-slate-400
                                "
                              >
                                Archived{" "}
                                {formatDate(
                                  document.archivedAt
                                )}
                              </p>


                              <div
                                className="
                                  mt-4
                                  flex
                                  flex-wrap
                                  gap-2
                                "
                              >

                                <a
                                  href={
                                    document.fileUrl
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className="
                                    inline-flex
                                    items-center
                                    rounded-lg
                                    border
                                    border-slate-200
                                    bg-white
                                    px-3
                                    py-2
                                    text-xs
                                    font-semibold
                                    text-slate-700
                                    hover:border-blue-300
                                    hover:text-blue-600
                                  "
                                >
                                  Open
                                </a>


                                <button
                                  type="button"
                                  onClick={
                                    () =>
                                      void handleRestoreDocument(
                                        document
                                      )
                                  }
                                  disabled={
                                    actionLoading
                                    === `document-restore-${document.id}`
                                  }
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-lg
                                    border
                                    border-emerald-200
                                    bg-emerald-50
                                    px-3
                                    py-2
                                    text-xs
                                    font-semibold
                                    text-emerald-700
                                    hover:bg-emerald-100
                                    disabled:opacity-50
                                  "
                                >

                                  {actionLoading
                                    === `document-restore-${document.id}`
                                    ? (
                                      <Loader2
                                        className="
                                          h-3.5
                                          w-3.5
                                          animate-spin
                                        "
                                      />
                                    )
                                    : (
                                      <RotateCcw
                                        className="
                                          h-3.5
                                          w-3.5
                                        "
                                      />
                                    )
                                  }

                                  Restore
                                </button>


                                {isSuperAdmin && (

                                  <button
                                    type="button"
                                    onClick={
                                      () =>
                                        void handleDeleteDocument(
                                          document
                                        )
                                    }
                                    disabled={
                                      actionLoading
                                      === `document-delete-${document.id}`
                                    }
                                    className="
                                      inline-flex
                                      items-center
                                      gap-1.5
                                      rounded-lg
                                      border
                                      border-red-200
                                      bg-red-50
                                      px-3
                                      py-2
                                      text-xs
                                      font-semibold
                                      text-red-700
                                      hover:bg-red-100
                                      disabled:opacity-50
                                    "
                                  >

                                    {actionLoading
                                      === `document-delete-${document.id}`
                                      ? (
                                        <Loader2
                                          className="
                                            h-3.5
                                            w-3.5
                                            animate-spin
                                          "
                                        />
                                      )
                                      : (
                                        <Trash2
                                          className="
                                            h-3.5
                                            w-3.5
                                          "
                                        />
                                      )
                                    }

                                    Permanent Delete
                                  </button>

                                )}

                              </div>

                            </div>

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
