"use client";

import Link from "next/link";
import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Save,
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
  MedicalRecord,
  TreatmentRecord,
  TreatmentRecordRequest,
} from "@/types/medicalRecord";


interface TreatmentManagementPageProps {
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
      requestError.response?.status
      === 400
    ) {
      return (
        requestError
          .response
          ?.data
          ?.message
        || "Please check the treatment information."
      );
    }

    if (
      requestError.response?.status
      === 403
    ) {
      return (
        "You do not have permission "
        + "to modify this treatment."
      );
    }

    if (
      requestError.response?.status
      === 404
    ) {
      return (
        "The Medical Record or Treatment "
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

  return "Unable to complete treatment request.";
}


export default function TreatmentManagementPage({
  params,
}: TreatmentManagementPageProps) {
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
    treatments,
    setTreatments,
  ] =
    useState<TreatmentRecord[]>(
      []
    );

  const [
    treatmentType,
    setTreatmentType,
  ] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [
    startDate,
    setStartDate,
  ] =
    useState(
      today()
    );

  const [
    endDate,
    setEndDate,
  ] =
    useState("");

  const [
    status,
    setStatus,
  ] =
    useState("ONGOING");

  const [
    editingTreatmentId,
    setEditingTreatmentId,
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
      setCurrentUser(
        getStoredUser()
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
   * LOAD RECORD + TREATMENTS
   * =========================================================
   */
  useEffect(
    () => {
      if (!medicalRecordId) {
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
              treatmentResponse,
            ] =
              await Promise.all([
                medicalRecordService
                  .getMedicalRecordById(
                    medicalRecordId
                  ),

                medicalRecordService
                  .getTreatmentsByRecord(
                    medicalRecordId
                  ),
              ]);

            if (cancelled) {
              return;
            }

            setMedicalRecord(
              recordResponse
            );

            setTreatments(
              treatmentResponse
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


  const canModify =
    Boolean(
      currentUser?.role
        === "DOCTOR"
      && medicalRecord
      && medicalRecord.doctorId
        === currentUser.id
    );


  /*
   * =========================================================
   * RESET FORM
   * =========================================================
   */
  const resetForm =
    () => {
      setEditingTreatmentId(
        null
      );

      setTreatmentType(
        ""
      );

      setDescription(
        ""
      );

      setStartDate(
        today()
      );

      setEndDate(
        ""
      );

      setStatus(
        "ONGOING"
      );
    };


  /*
   * =========================================================
   * START EDIT
   * =========================================================
   */
  const startEdit =
    (
      treatment:
      TreatmentRecord
    ) => {
      setEditingTreatmentId(
        treatment.id
      );

      setTreatmentType(
        treatment.treatmentType
        ?? ""
      );

      setDescription(
        treatment.description
        ?? ""
      );

      setStartDate(
        normalizeDate(
          treatment.startDate
        )
      );

      setEndDate(
        normalizeDate(
          treatment.endDate
        )
      );

      setStatus(
        treatment.status
        ?? "ONGOING"
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

      if (!medicalRecord) {
        setError(
          "Medical Record is not available."
        );

        return;
      }

      if (!canModify) {
        setError(
          "You can only manage treatments "
          + "for your own Medical Records."
        );

        return;
      }

      if (
        !treatmentType.trim()
        || !startDate
      ) {
        setError(
          "Treatment type and start date are required."
        );

        return;
      }

      if (
        endDate
        && new Date(endDate).getTime()
          < new Date(startDate).getTime()
      ) {
        setError(
          "End date cannot be before start date."
        );

        return;
      }

      const request:
        TreatmentRecordRequest = {
          medicalRecordId:
            medicalRecord.id,

          patientId:
            medicalRecord.patientId,

          treatmentType:
            treatmentType.trim(),

          description:
            description.trim()
            || undefined,

          startDate,

          endDate:
            endDate
            || undefined,

          status:
            status.trim(),
        };


      setSubmitting(true);
      setError("");
      setSuccess("");


      try {
        if (
          editingTreatmentId
        ) {
          await medicalRecordService
            .updateTreatment(
              editingTreatmentId,
              request
            );

          setSuccess(
            "Treatment updated successfully."
          );
        } else {
          await medicalRecordService
            .createTreatment(
              request
            );

          setSuccess(
            "Treatment added successfully."
          );
        }


        const refreshed =
          await medicalRecordService
            .getTreatmentsByRecord(
              medicalRecord.id
            );

        setTreatments(
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
      treatment:
      TreatmentRecord
    ) => {
      if (!canModify) {
        setError(
          "You cannot delete this treatment."
        );

        return;
      }

      if (
        treatment.doctorId
        !== currentUser?.id
      ) {
        setError(
          "You can only delete treatments created by you."
        );

        return;
      }

      const confirmed =
        window.confirm(
          `Delete treatment "${treatment.treatmentType}"?`
        );

      if (!confirmed) {
        return;
      }

      setDeletingId(
        treatment.id
      );

      setError("");
      setSuccess("");

      try {
        await medicalRecordService
          .deleteTreatment(
            treatment.id
          );

        setTreatments(
          (
            previous
          ) =>
            previous.filter(
              (
                item
              ) =>
                item.id
                !== treatment.id
            )
        );

        if (
          editingTreatmentId
          === treatment.id
        ) {
          resetForm();
        }

        setSuccess(
          "Treatment deleted successfully."
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
      pageTitle="Treatment Management"
    >
      <div
        className="
          mx-auto
          w-full
          max-w-6xl
          space-y-5
        "
      >
        {/* HEADER */}
        <div>
          <Link
            href={
              detailsHref
            }
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
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-emerald-50
                text-emerald-600
              "
            >
              <Activity
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
                Treatment Management
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Add and maintain treatment
                records linked to this visit.
              </p>
            </div>
          </div>
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

            <div>
              <p
                className="
                  text-sm
                  font-semibold
                "
              >
                Treatment request failed
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


        {/* SUCCESS */}
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
            <div
              className="
                text-center
              "
            >
              <Loader2
                className="
                  mx-auto
                  h-8
                  w-8
                  animate-spin
                  text-emerald-600
                "
              />

              <p
                className="
                  mt-3
                  text-sm
                  text-slate-500
                "
              >
                Loading treatments...
              </p>
            </div>
          </div>
        )}


        {!loading
          && medicalRecord
          && (
            <>
              {/* RECORD SUMMARY */}
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


              {/* DOCTOR FORM */}
              {canModify && (
                <section
                  className="
                    rounded-2xl
                    border
                    border-emerald-100
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
                        {editingTreatmentId
                          ? "Edit Treatment"
                          : "Add Treatment"
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


                    {editingTreatmentId && (
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
                    {/* TYPE */}
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
                        Treatment Type *
                      </label>

                      <input
                        type="text"
                        value={
                          treatmentType
                        }
                        onChange={
                          (
                            event
                          ) =>
                            setTreatmentType(
                              event.target.value
                            )
                        }
                        placeholder="e.g. Medication Therapy"
                        className="
                          w-full
                          rounded-xl
                          border
                          border-slate-200
                          px-3
                          py-2.5
                          text-sm
                          outline-none
                          focus:border-emerald-500
                          focus:ring-2
                          focus:ring-emerald-100
                        "
                      />
                    </div>


                    {/* STATUS */}
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
                        Status
                      </label>

                      <select
                        value={
                          status
                        }
                        onChange={
                          (
                            event
                          ) =>
                            setStatus(
                              event.target.value
                            )
                        }
                        className="
                          w-full
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          px-3
                          py-2.5
                          text-sm
                          outline-none
                          focus:border-emerald-500
                          focus:ring-2
                          focus:ring-emerald-100
                        "
                      >
                        <option value="ONGOING">
                          Ongoing
                        </option>

                        <option value="COMPLETED">
                          Completed
                        </option>

                        <option value="PAUSED">
                          Paused
                        </option>

                        <option value="CANCELLED">
                          Cancelled
                        </option>
                      </select>
                    </div>


                    {/* START DATE */}
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
                        Start Date *
                      </label>

                      <input
                        type="date"
                        value={
                          startDate
                        }
                        onChange={
                          (
                            event
                          ) =>
                            setStartDate(
                              event.target.value
                            )
                        }
                        className="
                          w-full
                          rounded-xl
                          border
                          border-slate-200
                          px-3
                          py-2.5
                          text-sm
                          outline-none
                          focus:border-emerald-500
                          focus:ring-2
                          focus:ring-emerald-100
                        "
                      />
                    </div>


                    {/* END DATE */}
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
                        End Date
                      </label>

                      <input
                        type="date"
                        value={
                          endDate
                        }
                        min={
                          startDate
                        }
                        onChange={
                          (
                            event
                          ) =>
                            setEndDate(
                              event.target.value
                            )
                        }
                        className="
                          w-full
                          rounded-xl
                          border
                          border-slate-200
                          px-3
                          py-2.5
                          text-sm
                          outline-none
                          focus:border-emerald-500
                          focus:ring-2
                          focus:ring-emerald-100
                        "
                      />
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
                        placeholder="Treatment instructions or clinical details..."
                        className="
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
                          focus:border-emerald-500
                          focus:ring-2
                          focus:ring-emerald-100
                        "
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
                          || !treatmentType
                            .trim()
                          || !startDate
                        }
                        className="
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-emerald-600
                          px-5
                          py-2.5
                          text-sm
                          font-semibold
                          text-white
                          transition
                          hover:bg-emerald-700
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
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
                          : editingTreatmentId
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
                          : editingTreatmentId
                            ? "Save Treatment"
                            : "Add Treatment"
                        }
                      </button>
                    </div>
                  </form>
                </section>
              )}


              {/* TREATMENT LIST */}
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


                {treatments.length === 0
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
                      <Activity
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
                        No treatments yet
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
                      {treatments.map(
                        (
                          treatment
                        ) => {
                          const ownsTreatment =
                            currentUser?.role
                              === "DOCTOR"
                            && treatment.doctorId
                              === currentUser.id;

                          return (
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
                                <div>
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

                                  <p
                                    className="
                                      mt-1
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
                                </div>


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


                              {ownsTreatment
                                && canModify
                                && (
                                  <div
                                    className="
                                      mt-4
                                      flex
                                      flex-wrap
                                      gap-2
                                      border-t
                                      border-emerald-100
                                      pt-3
                                    "
                                  >
                                    <button
                                      type="button"
                                      onClick={
                                        () =>
                                          startEdit(
                                            treatment
                                          )
                                      }
                                      className="
                                        inline-flex
                                        items-center
                                        gap-1.5
                                        rounded-lg
                                        border
                                        border-emerald-200
                                        bg-white
                                        px-3
                                        py-2
                                        text-xs
                                        font-semibold
                                        text-emerald-700
                                        hover:bg-emerald-50
                                      "
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
                                            treatment
                                          )
                                      }
                                      disabled={
                                        deletingId
                                        === treatment.id
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
                                        === treatment.id
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