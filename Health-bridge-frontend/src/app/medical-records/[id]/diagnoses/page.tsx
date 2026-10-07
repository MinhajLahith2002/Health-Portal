"use client";

import Link from "next/link";
import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Save,
  Stethoscope,
  Trash2,
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
  Diagnosis,
  DiagnosisRequest,
  MedicalRecord,
} from "@/types/medicalRecord";


interface DiagnosisManagementPageProps {
  params: Promise<{
    id: string;
  }>;
}


function today(): string {
  const date =
    new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function normalizeDate(
  value?: string | null
): string {

  if (!value) {
    return "";
  }

  return value.length >= 10
    ? value.slice(0, 10)
    : value;
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
        ?.status === 400
    ) {
      return (
        requestError
          .response
          ?.data
          ?.message
        || "Please check the diagnosis information."
      );
    }


    if (
      requestError
        .response
        ?.status === 403
    ) {
      return (
        "You do not have permission "
        + "to modify this diagnosis."
      );
    }


    if (
      requestError
        .response
        ?.status === 404
    ) {
      return (
        "The Medical Record or Diagnosis "
        + "was not found."
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


  return "Unable to complete diagnosis request.";
}


export default function DiagnosisManagementPage({
  params,
}: DiagnosisManagementPageProps) {

  const [
    currentUser,
    setCurrentUser,
  ] =
    useState<AuthUser | null>(
      null
    );


  const [
    medicalRecordId,
    setMedicalRecordId,
  ] =
    useState("");


  const [
    medicalRecord,
    setMedicalRecord,
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
    diagnosisName,
    setDiagnosisName,
  ] =
    useState("");


  const [
    description,
    setDescription,
  ] =
    useState("");


  const [
    severity,
    setSeverity,
  ] =
    useState("");


  const [
    diagnosedDate,
    setDiagnosedDate,
  ] =
    useState(
      today()
    );


  const [
    editingDiagnosisId,
    setEditingDiagnosisId,
  ] =
    useState<string | null>(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);


  const [
    deletingId,
    setDeletingId,
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


  /*
   * =========================================================
   * USER + ROUTE PARAM
   * =========================================================
   */
  useEffect(
    () => {

      const storedUser =
        getStoredUser();


      setCurrentUser(
        storedUser
      );


      const resolveParams =
        async () => {

          const resolved =
            await params;


          setMedicalRecordId(
            resolved.id
          );
        };


      void resolveParams();

    },
    [
      params,
    ]
  );


  /*
   * =========================================================
   * LOAD RECORD + DIAGNOSES
   * =========================================================
   */
  useEffect(
    () => {

      if (
        !medicalRecordId
      ) {
        return;
      }


      let cancelled =
        false;


      const loadData =
        async () => {

          setLoading(true);
          setError("");


          try {

            const [
              recordResponse,
              diagnosisResponse,
            ] =
              await Promise.all([
                medicalRecordService
                  .getMedicalRecordById(
                    medicalRecordId
                  ),

                medicalRecordService
                  .getDiagnosesByRecord(
                    medicalRecordId
                  ),
              ]);


            if (cancelled) {
              return;
            }


            setMedicalRecord(
              recordResponse
            );


            setDiagnoses(
              diagnosisResponse
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
              setLoading(false);
            }
          }
        };


      void loadData();


      return () => {
        cancelled = true;
      };

    },
    [
      medicalRecordId,
    ]
  );


  const isDoctor =
    currentUser?.role
    === "DOCTOR";


  const canModify =
    Boolean(
      isDoctor
      && medicalRecord
      && medicalRecord.doctorId
      === currentUser?.id
    );


  /*
   * =========================================================
   * RESET FORM
   * =========================================================
   */
  const resetForm =
    () => {

      setEditingDiagnosisId(
        null
      );

      setDiagnosisName(
        ""
      );

      setDescription(
        ""
      );

      setSeverity(
        ""
      );

      setDiagnosedDate(
        today()
      );
    };


  /*
   * =========================================================
   * START EDIT
   * =========================================================
   */
  const startEdit =
    (
      diagnosis:
      Diagnosis
    ) => {

      setEditingDiagnosisId(
        diagnosis.id
      );

      setDiagnosisName(
        diagnosis.diagnosisName
        ?? ""
      );

      setDescription(
        diagnosis.description
        ?? ""
      );

      setSeverity(
        diagnosis.severity
        ?? ""
      );

      setDiagnosedDate(
        normalizeDate(
          diagnosis.diagnosedDate
        )
      );


      setError("");
      setSuccess("");


      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };


  /*
   * =========================================================
   * CREATE / UPDATE
   * =========================================================
   */
  const handleSubmit =
    async (
      event:
      FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();


      if (
        !medicalRecord
      ) {

        setError(
          "Medical Record is not available."
        );

        return;
      }


      if (!canModify) {

        setError(
          "You can only manage diagnoses "
          + "for your own Medical Records."
        );

        return;
      }


      if (
        !diagnosisName.trim()
        || !diagnosedDate
      ) {

        setError(
          "Diagnosis name and diagnosed date are required."
        );

        return;
      }


      if (
        diagnosedDate > today()
      ) {

        setError(
          "Diagnosed date cannot be in the future."
        );

        return;
      }


      const request:
        DiagnosisRequest = {

          medicalRecordId:
            medicalRecord.id,

          patientId:
            medicalRecord.patientId,

          diagnosisName:
            diagnosisName.trim(),

          description:
            description.trim()
            || undefined,

          severity:
            severity.trim()
            || undefined,

          diagnosedDate,
        };


      setSubmitting(true);
      setError("");
      setSuccess("");


      try {

        if (
          editingDiagnosisId
        ) {

          await medicalRecordService
            .updateDiagnosis(
              editingDiagnosisId,
              request
            );


          setSuccess(
            "Diagnosis updated successfully."
          );

        } else {

          await medicalRecordService
            .createDiagnosis(
              request
            );


          setSuccess(
            "Diagnosis added successfully."
          );
        }


        const refreshed =
          await medicalRecordService
            .getDiagnosesByRecord(
              medicalRecord.id
            );


        setDiagnoses(
          refreshed
        );


        resetForm();


      } catch (
        requestError
      ) {

        setError(
          getErrorMessage(
            requestError
          )
        );


      } finally {

        setSubmitting(false);
      }
    };


  /*
   * =========================================================
   * DELETE
   * =========================================================
   */
  const handleDelete =
    async (
      diagnosis:
      Diagnosis
    ) => {

      if (!canModify) {

        setError(
          "You cannot delete this diagnosis."
        );

        return;
      }


      if (
        diagnosis.doctorId
        !== currentUser?.id
      ) {

        setError(
          "You can only delete diagnoses created by you."
        );

        return;
      }


      const confirmed =
        window.confirm(
          `Delete diagnosis "${diagnosis.diagnosisName}"?`
        );


      if (!confirmed) {
        return;
      }


      setDeletingId(
        diagnosis.id
      );

      setError("");
      setSuccess("");


      try {

        await medicalRecordService
          .deleteDiagnosis(
            diagnosis.id
          );


        setDiagnoses(
          (
            previous
          ) =>
            previous.filter(
              (
                item
              ) =>
                item.id
                !== diagnosis.id
            )
        );


        if (
          editingDiagnosisId
          === diagnosis.id
        ) {
          resetForm();
        }


        setSuccess(
          "Diagnosis deleted successfully."
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

        setDeletingId(
          null
        );
      }
    };


  const detailsHref =
    medicalRecordId
      ? (
        `/medical-records/${
          encodeURIComponent(
            medicalRecordId
          )
        }`
      )
      : "/medical-records";


  return (
    <DashboardLayout
      pageTitle="Diagnosis Management"
    >

      <div
        className="
          mx-auto
          w-full
          max-w-6xl
          space-y-5
        "
      >

        {/* ==============================================
            HEADER
            ============================================== */}
        <div>

          <Link
            href={
              detailsHref
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

            Back to Medical Record
          </Link>


          <div
            className="
              mt-4
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
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-blue-50
                text-blue-600
              `
                : `
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-indigo-50
                text-indigo-600
              `
            }
            >
              <Stethoscope
                className="
                  h-6
                  w-6
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
                Diagnosis Management
              </h1>


              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Add and maintain diagnoses
                linked to this Medical Record.
              </p>

            </div>

          </div>

        </div>


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
                Diagnosis request failed
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
            SUCCESS
            ============================================== */}
        {success && (

          <div
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-emerald-200
              bg-emerald-50
              p-4
              text-emerald-700
            "
          >

            <CheckCircle2
              className="
                h-5
                w-5
              "
            />


            <p
              className="
                text-sm
                font-semibold
              "
            >
              {success}
            </p>

          </div>
        )}


        {/* ==============================================
            LOADING
            ============================================== */}
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
                  text-indigo-600
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
                Loading diagnoses...
              </p>

            </div>

          </div>
        )}


        {!loading
          && medicalRecord
          && (
            <>

              {/* ==========================================
                  MEDICAL RECORD SUMMARY
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
                      Medical Record
                    </p>


                    <h2
                      className="
                        mt-1
                        text-lg
                        font-bold
                        text-slate-900
                      "
                    >
                      {
                        medicalRecord.diagnosis
                      }
                    </h2>


                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-500
                      "
                    >
                      {
                        medicalRecord.recordType
                      }
                      {" • "}
                      {formatDate(
                        medicalRecord.visitDate
                      )}
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
                        medicalRecord.doctorName
                      }
                    </p>

                  </div>

                </div>

              </section>


              {/* ==========================================
                  DOCTOR FORM
                  ========================================== */}
              {canModify && (

                <section
                  className={
              isDoctor
                ? `
                    rounded-2xl
                    border
                    border-blue-100
                    bg-white
                    p-5
                    shadow-sm
                  `
                : `
                    rounded-2xl
                    border
                    border-indigo-100
                    bg-white
                    p-5
                    shadow-sm
                  `
            }
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
                        {editingDiagnosisId
                          ? "Edit Diagnosis"
                          : "Add Diagnosis"
                        }
                      </h2>


                      <p
                        className="
                          mt-1
                          text-sm
                          text-slate-500
                        "
                      >
                        Doctor identity is
                        taken from your JWT.
                      </p>

                    </div>


                    {editingDiagnosisId && (

                      <button
                        type="button"
                        onClick={
                          resetForm
                        }
                        className="
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          px-3
                          py-2
                          text-sm
                          font-semibold
                          text-slate-600
                          hover:bg-slate-50
                        "
                      >
                        <X
                          className="
                            h-4
                            w-4
                          "
                        />

                        Cancel Edit
                      </button>
                    )}

                  </div>


                  <form
                    onSubmit={
                      handleSubmit
                    }
                    className="
                      mt-5
                      grid
                      gap-4
                      md:grid-cols-2
                    "
                  >

                    {/* DIAGNOSIS NAME */}
                    <div>

                      <label
                        className="
                          mb-1.5
                          block
                          text-sm
                          font-semibold
                          text-slate-700
                        "
                      >
                        Diagnosis Name *
                      </label>


                      <input
                        type="text"
                        value={
                          diagnosisName
                        }
                        onChange={
                          (
                            event
                          ) =>
                            setDiagnosisName(
                              event.target.value
                            )
                        }
                        placeholder="e.g. Essential Hypertension"
                        className={
              isDoctor
                ? `
                          w-full
                          rounded-xl
                          border
                          border-slate-200
                          px-3
                          py-2.5
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
                          px-3
                          py-2.5
                          text-sm
                          outline-none
                          focus:border-indigo-500
                          focus:ring-2
                          focus:ring-indigo-100
                        `
            }
                      />

                    </div>


                    {/* DATE */}
                    <div>

                      <label
                        className="
                          mb-1.5
                          block
                          text-sm
                          font-semibold
                          text-slate-700
                        "
                      >
                        Diagnosed Date *
                      </label>


                      <input
                        type="date"
                        value={
                          diagnosedDate
                        }
                        max={
                          today()
                        }
                        onChange={
                          (
                            event
                          ) =>
                            setDiagnosedDate(
                              event.target.value
                            )
                        }
                        className={
              isDoctor
                ? `
                          w-full
                          rounded-xl
                          border
                          border-slate-200
                          px-3
                          py-2.5
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
                          px-3
                          py-2.5
                          text-sm
                          outline-none
                          focus:border-indigo-500
                          focus:ring-2
                          focus:ring-indigo-100
                        `
            }
                      />

                    </div>


                    {/* SEVERITY */}
                    <div>

                      <label
                        className="
                          mb-1.5
                          block
                          text-sm
                          font-semibold
                          text-slate-700
                        "
                      >
                        Severity
                      </label>


                      <select
                        value={
                          severity
                        }
                        onChange={
                          (
                            event
                          ) =>
                            setSeverity(
                              event.target.value
                            )
                        }
                        className={
              isDoctor
                ? `
                          w-full
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          px-3
                          py-2.5
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
                          px-3
                          py-2.5
                          text-sm
                          outline-none
                          focus:border-indigo-500
                          focus:ring-2
                          focus:ring-indigo-100
                        `
            }
                      >

                        <option value="">
                          Select severity
                        </option>

                        <option value="MILD">
                          Mild
                        </option>

                        <option value="MODERATE">
                          Moderate
                        </option>

                        <option value="SEVERE">
                          Severe
                        </option>

                        <option value="CRITICAL">
                          Critical
                        </option>

                      </select>

                    </div>


                    {/* DESCRIPTION */}
                    <div
                      className="
                        md:col-span-2
                      "
                    >

                      <label
                        className="
                          mb-1.5
                          block
                          text-sm
                          font-semibold
                          text-slate-700
                        "
                      >
                        Description
                      </label>


                      <textarea
                        rows={4}
                        value={
                          description
                        }
                        onChange={
                          (
                            event
                          ) =>
                            setDescription(
                              event.target.value
                            )
                        }
                        placeholder="Additional diagnosis details..."
                        className={
              isDoctor
                ? `
                          w-full
                          resize-y
                          rounded-xl
                          border
                          border-slate-200
                          px-3
                          py-2.5
                          text-sm
                          leading-6
                          outline-none
                          focus:border-blue-500
                          focus:ring-2
                          focus:ring-blue-100
                        `
                : `
                          w-full
                          resize-y
                          rounded-xl
                          border
                          border-slate-200
                          px-3
                          py-2.5
                          text-sm
                          leading-6
                          outline-none
                          focus:border-indigo-500
                          focus:ring-2
                          focus:ring-indigo-100
                        `
            }
                      />

                    </div>


                    {/* SUBMIT */}
                    <div
                      className="
                        md:col-span-2
                      "
                    >

                      <button
                        type="submit"
                        disabled={
                          submitting
                          || !diagnosisName
                            .trim()
                          || !diagnosedDate
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
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        `
                : `
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-indigo-600
                          px-5
                          py-2.5
                          text-sm
                          font-semibold
                          text-white
                          transition
                          hover:bg-indigo-700
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        `
            }
                      >

                        {submitting
                          ? (
                            <Loader2
                              className="
                                h-4
                                w-4
                                animate-spin
                              "
                            />
                          )
                          : editingDiagnosisId
                            ? (
                              <Save
                                className="
                                  h-4
                                  w-4
                                "
                              />
                            )
                            : (
                              <Plus
                                className="
                                  h-4
                                  w-4
                                "
                              />
                            )
                        }


                        {submitting
                          ? "Saving..."
                          : editingDiagnosisId
                            ? "Save Diagnosis"
                            : "Add Diagnosis"
                        }

                      </button>

                    </div>

                  </form>

                </section>
              )}


              {/* ==========================================
                  DIAGNOSIS LIST
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


                {diagnoses.length === 0
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
                      "
                    >

                      <Stethoscope
                        className="
                          mx-auto
                          h-9
                          w-9
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
                        No diagnoses yet
                      </p>

                    </div>

                  )
                  : (

                    <div
                      className="
                        mt-5
                        grid
                        gap-4
                        md:grid-cols-2
                      "
                    >

                      {diagnoses.map(
                        (
                          diagnosis
                        ) => {

                          const ownsDiagnosis =
                            currentUser
                              ?.role === "DOCTOR"
                            && diagnosis
                              .doctorId
                              === currentUser.id;


                          return (

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

                                <div>

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


                                  <p
                                    className={
              isDoctor
                ? `
                                      mt-1
                                      text-xs
                                      text-blue-500
                                    `
                : `
                                      mt-1
                                      text-xs
                                      text-indigo-500
                                    `
            }
                                  >
                                    {formatDate(
                                      diagnosis.diagnosedDate
                                    )}
                                  </p>

                                </div>


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


                              {ownsDiagnosis
                                && canModify
                                && (

                                  <div
                                    className={
              isDoctor
                ? `
                                      mt-4
                                      flex
                                      flex-wrap
                                      gap-2
                                      border-t
                                      border-blue-100
                                      pt-3
                                    `
                : `
                                      mt-4
                                      flex
                                      flex-wrap
                                      gap-2
                                      border-t
                                      border-indigo-100
                                      pt-3
                                    `
            }
                                  >

                                    <button
                                      type="button"
                                      onClick={
                                        () =>
                                          startEdit(
                                            diagnosis
                                          )
                                      }
                                      className={
              isDoctor
                ? `
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-lg
                                        border
                                        border-blue-200
                                        bg-white
                                        px-3
                                        py-2
                                        text-xs
                                        font-semibold
                                        text-blue-700
                                        hover:bg-blue-50
                                      `
                : `
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-lg
                                        border
                                        border-indigo-200
                                        bg-white
                                        px-3
                                        py-2
                                        text-xs
                                        font-semibold
                                        text-indigo-700
                                        hover:bg-indigo-50
                                      `
            }
                                    >
                                      <Pencil
                                        className="
                                          h-3.5
                                          w-3.5
                                        "
                                      />

                                      Edit
                                    </button>


                                    <button
                                      type="button"
                                      onClick={
                                        () =>
                                          void handleDelete(
                                            diagnosis
                                          )
                                      }
                                      disabled={
                                        deletingId
                                        === diagnosis.id
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

                                      {deletingId
                                        === diagnosis.id
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

                                      Delete
                                    </button>

                                  </div>
                                )
                              }

                            </article>
                          );
                        }
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