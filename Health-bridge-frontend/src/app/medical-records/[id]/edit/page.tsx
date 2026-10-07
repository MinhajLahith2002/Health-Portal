"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  Loader2,
  Save,
  Stethoscope,
  UserRound,
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
  MedicalRecordRequest,
} from "@/types/medicalRecord";


interface EditMedicalRecordPageProps {
  params: Promise<{
    id: string;
  }>;
}


type ValidationField =
  | "visitDate"
  | "hospitalName"
  | "recordType"
  | "diagnosis"
  | "clinicalSummary"
  | "consultationNotes";


type ValidationErrors =
  Partial<
    Record<
      ValidationField,
      string
    >
  >;


type TouchedFields =
  Record<
    ValidationField,
    boolean
  >;


const RECORD_TYPES = [
  "Consultation",
  "Follow-up",
  "Emergency",
  "Admission",
  "Discharge",
  "Procedure",
  "Other",
] as const;


const INITIAL_TOUCHED_FIELDS:
  TouchedFields = {
    visitDate: false,
    hospitalName: false,
    recordType: false,
    diagnosis: false,
    clinicalSummary: false,
    consultationNotes: false,
  };


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
        || "Please check the entered clinical information."
      );
    }

    if (
      requestError.response?.status
      === 403
    ) {
      return (
        "You do not have permission "
        + "to update this Medical Record."
      );
    }

    if (
      requestError.response?.status
      === 404
    ) {
      return (
        "The requested Medical Record "
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

  return "Unable to update Medical Record.";
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


export default function EditMedicalRecordPage({
  params,
}: EditMedicalRecordPageProps) {
  const router =
    useRouter();

  const [
    currentUser,
    setCurrentUser,
  ] = useState<AuthUser | null>(
    null
  );

  const [
    recordId,
    setRecordId,
  ] = useState("");

  const [
    originalRecord,
    setOriginalRecord,
  ] =
    useState<MedicalRecord | null>(
      null
    );

  const [
    patientId,
    setPatientId,
  ] = useState("");

  const [
    hospitalName,
    setHospitalName,
  ] = useState("");

  const [
    visitDate,
    setVisitDate,
  ] = useState("");

  const [
    recordType,
    setRecordType,
  ] = useState("");

  const [
    diagnosis,
    setDiagnosis,
  ] = useState("");

  const [
    clinicalSummary,
    setClinicalSummary,
  ] = useState("");

  const [
    consultationNotes,
    setConsultationNotes,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  const [
    touchedFields,
    setTouchedFields,
  ] =
    useState<TouchedFields>(
      {
        ...INITIAL_TOUCHED_FIELDS,
      }
    );


  /*
   * =========================================================
   * AUTH + ROUTE PARAM
   * =========================================================
   */
  useEffect(
    () => {
      const storedUser =
        getStoredUser();

      if (!storedUser) {
        setError(
          "Please login to edit Medical Records."
        );

        setLoading(false);

        return;
      }

      setCurrentUser(
        storedUser
      );

      const resolveParams =
        async () => {
          const resolved =
            await params;

          setRecordId(
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
   * LOAD EXISTING RECORD
   * =========================================================
   */
  useEffect(
    () => {
      if (
        !recordId
        || !currentUser
      ) {
        return;
      }

      if (
        currentUser.role
        !== "DOCTOR"
      ) {
        setError(
          "Only doctors can update Medical Records."
        );

        setLoading(false);

        return;
      }

      let cancelled =
        false;

      const loadRecord =
        async () => {
          setLoading(true);
          setError("");

          try {
            const record =
              await medicalRecordService
                .getMedicalRecordById(
                  recordId
                );

            if (cancelled) {
              return;
            }

            /*
             * Frontend safety check.
             * Backend also verifies ownership.
             */
            if (
              record.doctorId
              !== currentUser.id
            ) {
              setError(
                "You can only update Medical Records created by you."
              );

              setLoading(false);

              return;
            }

            setOriginalRecord(
              record
            );

            setPatientId(
              record.patientId
            );

            setHospitalName(
              record.hospitalName ?? ""
            );

            setVisitDate(
              normalizeDate(
                record.visitDate
              )
            );

            setRecordType(
              record.recordType ?? ""
            );

            setDiagnosis(
              record.diagnosis ?? ""
            );

            setClinicalSummary(
              record.clinicalSummary ?? ""
            );

            setConsultationNotes(
              record.consultationNotes
              ?? ""
            );


            setTouchedFields(
              {
                ...INITIAL_TOUCHED_FIELDS,
              }
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

      void loadRecord();

      return () => {
        cancelled = true;
      };
    },
    [
      recordId,
      currentUser,
    ]
  );


  /*
   * =========================================================
   * FIELD VALIDATION
   * =========================================================
   *
   * Clinical text is intentionally NOT restricted to letters.
   * Real medical text may contain numbers, slashes, hyphens,
   * percentages, brackets and other clinically useful symbols.
   */
  const validationErrors =
    useMemo<ValidationErrors>(
      () => {

        const errors:
          ValidationErrors = {};


        if (!visitDate) {

          errors.visitDate =
            "Visit date is required.";

        } else if (
          visitDate > today()
        ) {

          errors.visitDate =
            "Visit date cannot be in the future.";
        }


        const hospital =
          hospitalName.trim();


        if (!hospital) {

          errors.hospitalName =
            "Hospital / Clinic is required.";

        } else if (
          hospital.length < 2
        ) {

          errors.hospitalName =
            "Hospital / Clinic must be at least 2 characters.";

        } else if (
          hospital.length > 120
        ) {

          errors.hospitalName =
            "Hospital / Clinic cannot exceed 120 characters.";
        }


        if (
          !RECORD_TYPES.includes(
            recordType as
              typeof RECORD_TYPES[number]
          )
        ) {

          errors.recordType =
            "Please select a valid Record Type.";
        }


        const primaryDiagnosis =
          diagnosis.trim();


        if (!primaryDiagnosis) {

          errors.diagnosis =
            "Primary Diagnosis is required.";

        } else if (
          primaryDiagnosis.length < 2
        ) {

          errors.diagnosis =
            "Primary Diagnosis must be at least 2 characters.";

        } else if (
          primaryDiagnosis.length > 150
        ) {

          errors.diagnosis =
            "Primary Diagnosis cannot exceed 150 characters.";
        }


        const summary =
          clinicalSummary.trim();


        if (!summary) {

          errors.clinicalSummary =
            "Clinical Summary is required.";

        } else if (
          summary.length < 10
        ) {

          errors.clinicalSummary =
            "Clinical Summary must be at least 10 characters.";

        } else if (
          summary.length > 2000
        ) {

          errors.clinicalSummary =
            "Clinical Summary cannot exceed 2000 characters.";
        }


        if (
          consultationNotes.length > 5000
        ) {

          errors.consultationNotes =
            "Consultation Notes cannot exceed 5000 characters.";
        }


        return errors;
      },
      [
        visitDate,
        hospitalName,
        recordType,
        diagnosis,
        clinicalSummary,
        consultationNotes,
      ]
    );


  const formValid =
    Boolean(
      patientId.trim()
    )
    && Object.keys(
      validationErrors
    ).length === 0;


  const markFieldTouched =
    (
      field:
      ValidationField
    ) => {

      setTouchedFields(
        (
          current
        ) => ({
          ...current,
          [field]: true,
        })
      );
    };


  const shouldShowError =
    (
      field:
      ValidationField
    ) =>
      touchedFields[field]
      && Boolean(
        validationErrors[field]
      );



  /*
   * =========================================================
   * UPDATE RECORD
   * =========================================================
   */
  const handleSubmit =
    async (
      event:
      FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (
        !currentUser
        || currentUser.role
        !== "DOCTOR"
      ) {
        setError(
          "Only doctors can update Medical Records."
        );

        return;
      }

      if (
        !originalRecord
      ) {
        setError(
          "Medical Record is not available."
        );

        return;
      }

      if (
        originalRecord.doctorId
        !== currentUser.id
      ) {
        setError(
          "You can only update Medical Records created by you."
        );

        return;
      }

      setTouchedFields(
        {
          visitDate: true,
          hospitalName: true,
          recordType: true,
          diagnosis: true,
          clinicalSummary: true,
          consultationNotes: true,
        }
      );


      if (!formValid) {
        setError(
          "Please fix the highlighted fields before saving changes."
        );

        return;
      }

      setSubmitting(true);
      setError("");
      setSuccess("");

      const request:
        MedicalRecordRequest = {
          /*
           * Patient ID is preserved.
           * User cannot change ownership.
           */
          patientId:
            originalRecord.patientId,

          hospitalName:
            hospitalName.trim(),

          visitDate,

          recordType:
            recordType.trim(),

          diagnosis:
            diagnosis.trim(),

          clinicalSummary:
            clinicalSummary.trim(),

          /*
           * Legacy fields are no longer editable in the UI.
           * Preserve any historical values already stored.
           */
          symptoms:
            originalRecord.symptoms
            ?? [],

          treatmentPlan:
            originalRecord.treatmentPlan
            ?? [],

          consultationNotes:
            consultationNotes
              .trim()
            || undefined,

          /*
           * Preserve current status.
           */
          status:
            originalRecord.status,
        };

      try {
        const updated =
          await medicalRecordService
            .updateMedicalRecord(
              recordId,
              request
            );

        setSuccess(
          "Medical Record updated successfully."
        );

        setTimeout(
          () => {
            router.push(
              `/medical-records/${
                encodeURIComponent(
                  updated.id
                )
              }`
            );
          },
          700
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
        setSubmitting(false);
      }
    };


  const detailsHref =
    recordId
      ? (
        `/medical-records/${
          encodeURIComponent(
            recordId
          )
        }`
      )
      : "/medical-records";


  return (
    <DashboardLayout
      pageTitle="Edit Medical Record"
    >
      <div
        className="
          mx-auto
          w-full
          max-w-5xl
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
              transition
              hover:text-blue-700
            "
          >
            <ArrowLeft
              className="
                h-4
                w-4
              "
            />

            Back to Record
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
                bg-blue-50
                text-blue-600
              "
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
                Edit Medical Record
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Update clinical information
                for this patient visit.
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
                Unable to edit record
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
                className="
                  mx-auto
                  h-8
                  w-8
                  animate-spin
                  text-blue-600
                "
              />

              <p
                className="
                  mt-3
                  text-sm
                  text-slate-500
                "
              >
                Loading Medical Record...
              </p>
            </div>
          </div>
        )}


        {!loading
          && originalRecord
          && currentUser?.role
            === "DOCTOR"
          && originalRecord.doctorId
            === currentUser.id
          && (
            <form
              onSubmit={
                handleSubmit
              }
              noValidate
              className="
                space-y-5
              "
            >
              {/* DOCTOR + PATIENT */}
              <section
                className="
                  grid
                  gap-4
                  md:grid-cols-2
                "
              >
                <div
                  className="
                    rounded-2xl
                    border
                    border-blue-100
                    bg-blue-50/60
                    p-4
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
                      className="
                        h-5
                        w-5
                        text-blue-600
                      "
                    />

                    <div>
                      <p
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          text-blue-500
                        "
                      >
                        Doctor
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          font-bold
                          text-slate-800
                        "
                      >
                        {
                          currentUser.fullName
                        }
                      </p>
                    </div>
                  </div>
                </div>


                <div
                  className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-4
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
                      className="
                        h-5
                        w-5
                        text-slate-500
                      "
                    />

                    <div
                      className="
                        min-w-0
                      "
                    >
                      <p
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          text-slate-400
                        "
                      >
                        Patient ID
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
                        {patientId}
                      </p>
                    </div>
                  </div>

                  <p
                    className="
                      mt-3
                      text-xs
                      text-slate-400
                    "
                  >
                    Patient ownership cannot
                    be changed during an update.
                  </p>
                </div>
              </section>


              {/* VISIT INFORMATION */}
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
                  <CalendarDays
                    className="
                      h-5
                      w-5
                      text-blue-600
                    "
                  />

                  <h2
                    className="
                      text-lg
                      font-bold
                      text-slate-900
                    "
                  >
                    Visit Information
                  </h2>
                </div>

                <div
                  className="
                    mt-5
                    grid
                    gap-4
                    md:grid-cols-2
                  "
                >
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
                      Hospital / Clinic *
                    </label>

                    <input
                      type="text"
                      value={
                        hospitalName
                      }
                      required
                      minLength={2}
                      maxLength={120}
                      aria-invalid={
                        shouldShowError(
                          "hospitalName"
                        )
                      }
                      onBlur={
                        () =>
                          markFieldTouched(
                            "hospitalName"
                          )
                      }
                      onChange={
                        (
                          event
                        ) => {
                          setHospitalName(
                            event.target.value
                          );

                          setError("");
                        }
                      }
                      className={`
                        w-full
                        rounded-xl
                        border
                        px-3
                        py-2.5
                        text-sm
                        outline-none
                        ${
                          shouldShowError(
                            "hospitalName"
                          )
                            ? (
                              "border-red-300 "
                              + "focus:border-red-500 "
                              + "focus:ring-2 "
                              + "focus:ring-red-100"
                            )
                            : (
                              "border-slate-200 "
                              + "focus:border-blue-500 "
                              + "focus:ring-2 "
                              + "focus:ring-blue-100"
                            )
                        }
                      `}
                    />


                    <div
                      className="
                        mt-1.5
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                    >

                      <div>
                        {shouldShowError(
                          "hospitalName"
                        ) && (
                          <p
                            className="
                              text-xs
                              font-medium
                              text-red-600
                            "
                          >
                            {
                              validationErrors.hospitalName
                            }
                          </p>
                        )}
                      </div>


                      <span
                        className="
                          ml-auto
                          shrink-0
                          text-[11px]
                          text-slate-400
                        "
                      >
                        {hospitalName.length}/120
                      </span>

                    </div>
                  </div>


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
                      Visit Date *
                    </label>

                    <input
                      type="date"
                      value={
                        visitDate
                      }
                      required
                      max={today()}
                      aria-invalid={
                        shouldShowError(
                          "visitDate"
                        )
                      }
                      onBlur={
                        () =>
                          markFieldTouched(
                            "visitDate"
                          )
                      }
                      onChange={
                        (
                          event
                        ) => {
                          setVisitDate(
                            event.target.value
                          );

                          setError("");
                        }
                      }
                      className={`
                        w-full
                        rounded-xl
                        border
                        px-3
                        py-2.5
                        text-sm
                        outline-none
                        ${
                          shouldShowError(
                            "visitDate"
                          )
                            ? (
                              "border-red-300 "
                              + "focus:border-red-500 "
                              + "focus:ring-2 "
                              + "focus:ring-red-100"
                            )
                            : (
                              "border-slate-200 "
                              + "focus:border-blue-500 "
                              + "focus:ring-2 "
                              + "focus:ring-blue-100"
                            )
                        }
                      `}
                    />


                    {shouldShowError(
                      "visitDate"
                    ) && (
                      <p
                        className="
                          mt-1.5
                          text-xs
                          font-medium
                          text-red-600
                        "
                      >
                        {
                          validationErrors.visitDate
                        }
                      </p>
                    )}
                  </div>


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
                      Record Type *
                    </label>

                    <select
                      value={
                        recordType
                      }
                      required
                      aria-invalid={
                        shouldShowError(
                          "recordType"
                        )
                      }
                      onBlur={
                        () =>
                          markFieldTouched(
                            "recordType"
                          )
                      }
                      onChange={
                        (
                          event
                        ) => {
                          setRecordType(
                            event.target.value
                          );

                          setError("");
                        }
                      }
                      className={`
                        w-full
                        rounded-xl
                        border
                        bg-white
                        px-3
                        py-2.5
                        text-sm
                        outline-none
                        ${
                          shouldShowError(
                            "recordType"
                          )
                            ? (
                              "border-red-300 "
                              + "focus:border-red-500 "
                              + "focus:ring-2 "
                              + "focus:ring-red-100"
                            )
                            : (
                              "border-slate-200 "
                              + "focus:border-blue-500 "
                              + "focus:ring-2 "
                              + "focus:ring-blue-100"
                            )
                        }
                      `}
                    >
                      {RECORD_TYPES.map(
                        (
                          type
                        ) => (
                          <option
                            key={type}
                            value={type}
                          >
                            {type}
                          </option>
                        )
                      )}
                    </select>


                    {shouldShowError(
                      "recordType"
                    ) && (
                      <p
                        className="
                          mt-1.5
                          text-xs
                          font-medium
                          text-red-600
                        "
                      >
                        {
                          validationErrors.recordType
                        }
                      </p>
                    )}
                  </div>
                </div>
              </section>


              {/* CLINICAL */}
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
                    text-slate-900
                  "
                >
                  Clinical Details
                </h2>

                <div
                  className="
                    mt-5
                    space-y-4
                  "
                >
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
                      Primary Diagnosis *
                    </label>

                    <input
                      type="text"
                      value={
                        diagnosis
                      }
                      required
                      minLength={2}
                      maxLength={150}
                      aria-invalid={
                        shouldShowError(
                          "diagnosis"
                        )
                      }
                      onBlur={
                        () =>
                          markFieldTouched(
                            "diagnosis"
                          )
                      }
                      onChange={
                        (
                          event
                        ) => {
                          setDiagnosis(
                            event.target.value
                          );

                          setError("");
                        }
                      }
                      className={`
                        w-full
                        rounded-xl
                        border
                        px-3
                        py-2.5
                        text-sm
                        outline-none
                        ${
                          shouldShowError(
                            "diagnosis"
                          )
                            ? (
                              "border-red-300 "
                              + "focus:border-red-500 "
                              + "focus:ring-2 "
                              + "focus:ring-red-100"
                            )
                            : (
                              "border-slate-200 "
                              + "focus:border-blue-500 "
                              + "focus:ring-2 "
                              + "focus:ring-blue-100"
                            )
                        }
                      `}
                    />


                    <div
                      className="
                        mt-1.5
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                    >

                      <div>
                        {shouldShowError(
                          "diagnosis"
                        ) && (
                          <p
                            className="
                              text-xs
                              font-medium
                              text-red-600
                            "
                          >
                            {
                              validationErrors.diagnosis
                            }
                          </p>
                        )}
                      </div>


                      <span
                        className="
                          ml-auto
                          shrink-0
                          text-[11px]
                          text-slate-400
                        "
                      >
                        {diagnosis.length}/150
                      </span>

                    </div>
                  </div>


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
                      Clinical Summary *
                    </label>

                    <textarea
                      rows={5}
                      value={
                        clinicalSummary
                      }
                      required
                      minLength={10}
                      maxLength={2000}
                      aria-invalid={
                        shouldShowError(
                          "clinicalSummary"
                        )
                      }
                      onBlur={
                        () =>
                          markFieldTouched(
                            "clinicalSummary"
                          )
                      }
                      onChange={
                        (
                          event
                        ) => {
                          setClinicalSummary(
                            event.target.value
                          );

                          setError("");
                        }
                      }
                      className={`
                        w-full
                        resize-y
                        rounded-xl
                        border
                        px-3
                        py-2.5
                        text-sm
                        leading-6
                        outline-none
                        ${
                          shouldShowError(
                            "clinicalSummary"
                          )
                            ? (
                              "border-red-300 "
                              + "focus:border-red-500 "
                              + "focus:ring-2 "
                              + "focus:ring-red-100"
                            )
                            : (
                              "border-slate-200 "
                              + "focus:border-blue-500 "
                              + "focus:ring-2 "
                              + "focus:ring-blue-100"
                            )
                        }
                      `}
                    />


                    <div
                      className="
                        mt-1.5
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                    >

                      <div>
                        {shouldShowError(
                          "clinicalSummary"
                        ) && (
                          <p
                            className="
                              text-xs
                              font-medium
                              text-red-600
                            "
                          >
                            {
                              validationErrors.clinicalSummary
                            }
                          </p>
                        )}
                      </div>


                      <span
                        className="
                          ml-auto
                          shrink-0
                          text-[11px]
                          text-slate-400
                        "
                      >
                        {clinicalSummary.length}/2000
                      </span>

                    </div>
                  </div>
                </div>
              </section>


              {/* CLINICAL CHILD RECORDS NOTE */}
              <section
                className="
                  rounded-2xl
                  border
                  border-blue-100
                  bg-blue-50/60
                  p-4
                "
              >
                <p
                  className="
                    text-sm
                    font-semibold
                    text-blue-900
                  "
                >
                  Diagnoses and treatment records are managed separately.
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-blue-700
                  "
                >
                  Return to the Medical Record Details page and use
                  Manage Diagnoses or Manage Treatments.
                </p>
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
                    className="
                      h-5
                      w-5
                      text-blue-600
                    "
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

                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Optional. Maximum 5000 characters.
                </p>


                <textarea
                  rows={6}
                  value={
                    consultationNotes
                  }
                  maxLength={5000}
                  aria-invalid={
                    shouldShowError(
                      "consultationNotes"
                    )
                  }
                  onBlur={
                    () =>
                      markFieldTouched(
                        "consultationNotes"
                      )
                  }
                  onChange={
                    (
                      event
                    ) => {
                      setConsultationNotes(
                        event.target.value
                      );

                      setError("");
                    }
                  }
                  className={`
                    mt-4
                    w-full
                    resize-y
                    rounded-xl
                    border
                    px-3
                    py-2.5
                    text-sm
                    leading-6
                    outline-none
                    ${
                      shouldShowError(
                        "consultationNotes"
                      )
                        ? (
                          "border-red-300 "
                          + "focus:border-red-500 "
                          + "focus:ring-2 "
                          + "focus:ring-red-100"
                        )
                        : (
                          "border-slate-200 "
                          + "focus:border-blue-500 "
                          + "focus:ring-2 "
                          + "focus:ring-blue-100"
                        )
                    }
                  `}
                />


                <div
                  className="
                    mt-1.5
                    flex
                    items-start
                    justify-between
                    gap-3
                  "
                >

                  <div>
                    {shouldShowError(
                      "consultationNotes"
                    ) && (
                      <p
                        className="
                          text-xs
                          font-medium
                          text-red-600
                        "
                      >
                        {
                          validationErrors.consultationNotes
                        }
                      </p>
                    )}
                  </div>


                  <span
                    className="
                      ml-auto
                      shrink-0
                      text-[11px]
                      text-slate-400
                    "
                  >
                    {consultationNotes.length}/5000
                  </span>

                </div>
              </section>


              {/* ACTIONS */}
              <section
                className="
                  flex
                  flex-col-reverse
                  gap-3
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  p-5
                  shadow-sm
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <Link
                  href={
                    detailsHref
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-slate-200
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-700
                    hover:bg-slate-50
                  "
                >
                  Cancel
                </Link>

                <div
                  className="
                    flex
                    flex-col
                    items-stretch
                    gap-2
                    sm:items-end
                  "
                >

                  {!formValid && (
                    <p
                      className="
                        text-xs
                        text-slate-500
                      "
                    >
                      Complete all required fields correctly
                      to enable saving.
                    </p>
                  )}


                <button
                  type="submit"
                  disabled={
                    submitting
                    || !formValid
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    px-6
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-blue-700
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
                    : (
                      <Save
                        className="
                          h-4
                          w-4
                        "
                      />
                    )
                  }

                  {submitting
                    ? "Saving..."
                    : "Save Changes"
                  }
                </button>

                </div>
              </section>
            </form>
          )
        }
      </div>
    </DashboardLayout>
  );
}