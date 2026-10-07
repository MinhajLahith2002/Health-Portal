"use client";

import Link from "next/link";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardPlus,
  Loader2,
  Search,
  Stethoscope,
  UserCheck,
  UserRound,
  X,
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

import type {
  MedicalRecordRequest,
  PatientLookupResult,
} from "@/types/medicalRecord";


type ValidationField =
  | "patient"
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


const INITIAL_TOUCHED:
  TouchedFields = {

    patient: false,

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
        + "to perform this action."
      );
    }


    if (
      requestError
        .response
        ?.status === 404
    ) {

      return "Patient was not found.";
    }
  }


  return (
    "Request failed. Please try again."
  );
}


export default function CreateMedicalRecordPage() {

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
    selectedPatient,
    setSelectedPatient,
  ] =
    useState<PatientLookupResult | null>(
      null
    );


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
    patientListOpen,
    setPatientListOpen,
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


  const [
    hospitalName,
    setHospitalName,
  ] =
    useState("");


  const [
    visitDate,
    setVisitDate,
  ] =
    useState(
      today()
    );


  const [
    recordType,
    setRecordType,
  ] =
    useState(
      "Consultation"
    );


  const [
    diagnosis,
    setDiagnosis,
  ] =
    useState("");


  const [
    clinicalSummary,
    setClinicalSummary,
  ] =
    useState("");


  const [
    consultationNotes,
    setConsultationNotes,
  ] =
    useState("");


  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);


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


  const [
    touched,
    setTouched,
  ] =
    useState<TouchedFields>(
      {
        ...INITIAL_TOUCHED,
      }
    );


  const canCreate =
    currentUser?.role
    === "DOCTOR";


  /*
   * =========================================================
   * VALIDATION
   * =========================================================
   */
  const validationErrors =
    useMemo<ValidationErrors>(
      () => {

        const errors:
          ValidationErrors = {};


        /*
         * Patient
         */
        if (
          !selectedPatient?.id
        ) {

          errors.patient =
            "Please select a registered patient.";
        }


        /*
         * Visit Date
         */
        if (!visitDate) {

          errors.visitDate =
            "Visit date is required.";

        } else if (
          visitDate > today()
        ) {

          errors.visitDate =
            "Visit date cannot be in the future.";
        }


        /*
         * Hospital
         */
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


        /*
         * Record Type
         */
        if (
          !RECORD_TYPES.includes(
            recordType as
              typeof RECORD_TYPES[number]
          )
        ) {

          errors.recordType =
            "Please select a valid Record Type.";
        }


        /*
         * Primary Diagnosis
         */
        const diagnosisValue =
          diagnosis.trim();


        if (!diagnosisValue) {

          errors.diagnosis =
            "Primary Diagnosis is required.";

        } else if (
          diagnosisValue.length < 2
        ) {

          errors.diagnosis =
            "Primary Diagnosis must be at least 2 characters.";

        } else if (
          diagnosisValue.length > 150
        ) {

          errors.diagnosis =
            "Primary Diagnosis cannot exceed 150 characters.";
        }


        /*
         * Clinical Summary
         */
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


        /*
         * Consultation Notes
         *
         * Optional field.
         */
        if (
          consultationNotes.length
          > 5000
        ) {

          errors.consultationNotes =
            "Consultation Notes cannot exceed 5000 characters.";
        }


        return errors;

      },
      [
        selectedPatient,
        visitDate,
        hospitalName,
        recordType,
        diagnosis,
        clinicalSummary,
        consultationNotes,
      ]
    );


  const formValid =
    Object.keys(
      validationErrors
    ).length === 0;


  const markTouched =
    (
      field:
      ValidationField
    ) => {

      setTouched(
        (
          previous
        ) => ({
          ...previous,

          [field]:
            true,
        })
      );
    };


  const showError =
    (
      field:
      ValidationField
    ) => {

      return (
        touched[field]
        && Boolean(
          validationErrors[field]
        )
      );
    };


  /*
   * =========================================================
   * AUTH + OPTIONAL PATIENT ID
   * =========================================================
   */
  useEffect(
    () => {

      const storedUser =
        getStoredUser();


      if (!storedUser) {

        setError(
          "Please login to continue."
        );

        return;
      }


      setCurrentUser(
        storedUser
      );


      if (
        storedUser.role
        !== "DOCTOR"
      ) {

        setError(
          "Only doctors can create Medical Records."
        );

        return;
      }


      const params =
        new URLSearchParams(
          window.location.search
        );


      const patientId =
        params
          .get(
            "patientId"
          )
          ?.trim();


      if (!patientId) {
        return;
      }


      const resolvePatient =
        async () => {

          setSearchingPatients(
            true
          );


          try {

            const results =
              await medicalRecordService
                .searchPatients(
                  patientId
                );


            const exact =
              results.find(
                (
                  patient
                ) =>
                  patient.id
                  === patientId
              );


            if (exact) {

              setSelectedPatient(
                exact
              );


              setTouched(
                (
                  previous
                ) => ({
                  ...previous,

                  patient:
                    true,
                })
              );


              return;
            }


            setPatientSearch(
              patientId
            );


            setPatientResults(
              results
            );


            setPatientListOpen(
              true
            );


          } catch (
            requestError
          ) {

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


      void resolvePatient();

    },
    []
  );


  /*
   * =========================================================
   * PATIENT SEARCH DEBOUNCE
   * =========================================================
   */
  useEffect(
    () => {

      if (
        !canCreate
        || selectedPatient
      ) {

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


                  setPatientListOpen(
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

        cancelled =
          true;


        window.clearTimeout(
          timeout
        );
      };

    },
    [
      patientSearch,
      selectedPatient,
      canCreate,
    ]
  );


  /*
   * =========================================================
   * OPEN PATIENT LIST
   * =========================================================
   */
  const openPatientSelector =
    async () => {

      setPatientListOpen(
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
   */
  const closePatientSelector =
    () => {

      setPatientListOpen(
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


  /*
   * =========================================================
   * SELECT PATIENT
   * =========================================================
   */
  const selectPatient =
    (
      patient:
      PatientLookupResult
    ) => {

      setSelectedPatient(
        patient
      );


      setPatientSearch(
        ""
      );


      setPatientResults(
        []
      );


      setPatientListOpen(
        false
      );


      setPatientSearchError(
        ""
      );


      setError(
        ""
      );


      markTouched(
        "patient"
      );
    };


  /*
   * =========================================================
   * RESET CLINICAL DATA
   * =========================================================
   */
  const resetClinicalFields =
    () => {

      setHospitalName(
        ""
      );


      setVisitDate(
        today()
      );


      setRecordType(
        "Consultation"
      );


      setDiagnosis(
        ""
      );


      setClinicalSummary(
        ""
      );


      setConsultationNotes(
        ""
      );


      setError(
        ""
      );


      setSuccess(
        ""
      );


      setTouched(
        {
          ...INITIAL_TOUCHED,
        }
      );
    };


  const hasClinicalDraft =
    Boolean(
      hospitalName.trim()
      || diagnosis.trim()
      || clinicalSummary.trim()
      || consultationNotes.trim()
      || visitDate !== today()
      || recordType
        !== "Consultation"
    );


  /*
   * =========================================================
   * CHANGE PATIENT
   * =========================================================
   */
  const changePatient =
    () => {

      if (
        hasClinicalDraft
      ) {

        const confirmed =
          window.confirm(
            "Changing the patient will clear the clinical data "
            + "you have entered for this record. Continue?"
          );


        if (!confirmed) {
          return;
        }
      }


      resetClinicalFields();


      setSelectedPatient(
        null
      );


      setPatientSearch(
        ""
      );


      setPatientResults(
        []
      );


      setPatientListOpen(
        false
      );


      setPatientSearchError(
        ""
      );
    };


  /*
   * =========================================================
   * SUBMIT
   * =========================================================
   */
  const handleSubmit =
    async (
      event:
      FormEvent<HTMLFormElement>
    ) => {

      event.preventDefault();


      if (!canCreate) {

        setError(
          "Only doctors can create Medical Records."
        );

        return;
      }


      /*
       * Force all validation messages
       * to become visible after Submit.
       */
      setTouched(
        {
          patient: true,

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
          "Please fix the highlighted fields before creating the Medical Record."
        );

        return;
      }


      if (!selectedPatient) {

        setError(
          "Please select a patient."
        );

        return;
      }


      const request:
        MedicalRecordRequest = {

          patientId:
            selectedPatient.id,


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
           * These legacy arrays are intentionally
           * empty because Diagnosis and Treatment
           * records are managed separately after
           * Medical Record creation.
           */
          symptoms: [],


          treatmentPlan: [],


          consultationNotes:
            consultationNotes
              .trim()
            || undefined,
        };


      setSubmitting(
        true
      );


      setError(
        ""
      );


      setSuccess(
        ""
      );


      try {

        const created =
          await medicalRecordService
            .createMedicalRecord(
              request
            );


        setSuccess(
          "Medical Record created successfully."
        );


        window.setTimeout(
          () => {

            router.push(
              `/medical-records/${
                encodeURIComponent(
                  created.id
                )
              }`
            );

          },
          600
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

        setSubmitting(
          false
        );
      }
    };


  const backHref =
    selectedPatient
      ? (
        `/medical-records?patientId=${
          encodeURIComponent(
            selectedPatient.id
          )
        }`
      )
      : "/medical-records";


  return (

    <DashboardLayout
      pageTitle="Create Medical Record"
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
              backHref
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

            Back to EHR
          </Link>


          <div
            className="
              mt-4
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-blue-50
                text-blue-600
              "
            >
              <ClipboardPlus
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
                Create Medical Record
              </h1>


              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Record a new patient consultation,
                primary diagnosis, clinical summary
                and consultation notes.
              </p>

            </div>

          </div>

        </div>


        {/* AUTHENTICATED DOCTOR */}
        {currentUser && (

          <section
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

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  text-blue-600
                "
              >
                <Stethoscope
                  className="
                    h-5
                    w-5
                  "
                />
              </div>


              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    text-blue-500
                  "
                >
                  Authenticated Doctor
                </p>


                <p
                  className="
                    mt-1
                    text-sm
                    font-bold
                    text-slate-800
                  "
                >
                  {currentUser.fullName}
                </p>

              </div>

            </div>


            <p
              className="
                mt-3
                text-xs
                text-slate-500
              "
            >
              Doctor identity is taken securely
              from your JWT. It is not entered manually.
            </p>

          </section>
        )}


        {/* PAGE ERROR */}
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

            <p className="text-sm">
              {error}
            </p>
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


        {/* NOT DOCTOR */}
        {currentUser
          && !canCreate
          && (

            <section
              className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-10
                text-center
              "
            >
              <UserRound
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
                "
              >
                Doctor access required
              </h2>
            </section>
          )
        }


        {canCreate && (

          <form
            onSubmit={
              handleSubmit
            }
            noValidate
            className="
              space-y-5
            "
          >

            {/* ============================================
                VISIT INFORMATION
                ============================================ */}
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

                {/* PATIENT */}
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
                    "
                  >
                    Patient

                    <span
                      className="
                        ml-1
                        text-red-500
                      "
                    >
                      *
                    </span>
                  </label>


                  {selectedPatient
                    ? (

                      <div
                        className={`
                          rounded-2xl
                          border
                          bg-blue-50/60
                          p-4
                          ${
                            showError(
                              "patient"
                            )
                              ? "border-red-300"
                              : "border-blue-200"
                          }
                        `}
                      >

                        <div
                          className="
                            flex
                            flex-col
                            gap-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                          "
                        >

                          <div
                            className="
                              flex
                              items-start
                              gap-3
                            "
                          >

                            <div
                              className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                overflow-hidden
                                rounded-xl
                                bg-white
                                text-blue-600
                              "
                            >

                              {selectedPatient.picture
                                ? (

                                  <img
                                    src={
                                      selectedPatient.picture
                                    }
                                    alt=""
                                    className="
                                      h-full
                                      w-full
                                      object-cover
                                    "
                                  />

                                )
                                : (

                                  <UserCheck
                                    className="
                                      h-5
                                      w-5
                                    "
                                  />

                                )
                              }

                            </div>


                            <div>

                              <p
                                className="
                                  text-xs
                                  font-semibold
                                  uppercase
                                  text-blue-500
                                "
                              >
                                Selected Patient
                              </p>


                              <p
                                className="
                                  mt-1
                                  font-bold
                                  text-slate-900
                                "
                              >
                                {
                                  selectedPatient
                                    .fullName
                                }
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
                                {
                                  selectedPatient.id
                                }
                              </p>


                              <div
                                className="
                                  mt-2
                                  flex
                                  flex-wrap
                                  gap-2
                                "
                              >

                                {selectedPatient
                                  .dateOfBirth
                                  && (

                                    <span
                                      className="
                                        rounded-full
                                        bg-white
                                        px-2.5
                                        py-1
                                        text-xs
                                      "
                                    >
                                      DOB:{" "}
                                      {
                                        selectedPatient
                                          .dateOfBirth
                                      }
                                    </span>

                                  )
                                }


                                {selectedPatient
                                  .gender
                                  && (

                                    <span
                                      className="
                                        rounded-full
                                        bg-white
                                        px-2.5
                                        py-1
                                        text-xs
                                      "
                                    >
                                      {
                                        selectedPatient
                                          .gender
                                      }
                                    </span>

                                  )
                                }


                                {selectedPatient
                                  .bloodGroup
                                  && (

                                    <span
                                      className="
                                        rounded-full
                                        bg-white
                                        px-2.5
                                        py-1
                                        text-xs
                                        font-semibold
                                        text-rose-600
                                      "
                                    >
                                      Blood:{" "}
                                      {
                                        selectedPatient
                                          .bloodGroup
                                      }
                                    </span>

                                  )
                                }

                              </div>

                            </div>

                          </div>


                          <button
                            type="button"
                            onClick={
                              changePatient
                            }
                            className="
                              rounded-xl
                              border
                              border-blue-200
                              bg-white
                              px-4
                              py-2.5
                              text-sm
                              font-semibold
                              text-blue-700
                              transition
                              hover:bg-blue-50
                            "
                          >
                            Change Patient
                          </button>

                        </div>

                      </div>

                    )
                    : (

                      <div
                        className="
                          relative
                        "
                      >

                        <div
                          className="
                            relative
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
                            type="search"
                            value={
                              patientSearch
                            }
                            autoComplete="off"
                            aria-invalid={
                              showError(
                                "patient"
                              )
                            }
                            onFocus={
                              () => {

                                void openPatientSelector();
                              }
                            }
                            onChange={
                              (
                                event
                              ) => {

                                setPatientSearch(
                                  event.target.value
                                );


                                setPatientListOpen(
                                  true
                                );


                                setError(
                                  ""
                                );
                              }
                            }
                            placeholder="Search by patient name or exact Patient ID..."
                            className={`
                              w-full
                              rounded-xl
                              border
                              py-3
                              pl-10
                              pr-10
                              text-sm
                              outline-none
                              ${
                                showError(
                                  "patient"
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


                          {searchingPatients && (

                            <Loader2
                              className="
                                absolute
                                right-3
                                top-1/2
                                h-4
                                w-4
                                -translate-y-1/2
                                animate-spin
                                text-blue-600
                              "
                            />

                          )}

                        </div>


                        <p
                          className="
                            mt-2
                            text-xs
                            text-slate-500
                          "
                        >
                          Click the field to browse all registered
                          patients, or type a patient name or exact Patient ID.
                        </p>


                        {patientSearchError && (

                          <p
                            className="
                              mt-2
                              text-xs
                              text-red-600
                            "
                          >
                            {
                              patientSearchError
                            }
                          </p>

                        )}


                        {patientListOpen && (

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

                            {/* PATIENT LIST HEADER */}
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
                                  Select a patient for this Medical Record.
                                </p>

                              </div>


                              <button
                                type="button"
                                onClick={
                                  closePatientSelector
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
                              && patientResults
                                .length === 0
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

                                  Loading patients...
                                </div>

                              )
                              : patientResults
                                .length === 0
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
                                        text-slate-700
                                      "
                                    >
                                      No patients found
                                    </p>
                                  </div>

                                )
                                : (

                                  <div
                                    className="
                                      space-y-1
                                    "
                                  >

                                    {patientResults.map(
                                      (
                                        patient
                                      ) => (

                                        <button
                                          key={
                                            patient.id
                                          }
                                          type="button"
                                          onClick={
                                            () =>
                                              selectPatient(
                                                patient
                                              )
                                          }
                                          className="
                                            flex
                                            w-full
                                            items-start
                                            gap-3
                                            rounded-xl
                                            p-3
                                            text-left
                                            transition
                                            hover:bg-blue-50
                                          "
                                        >

                                          <div
                                            className="
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
                                            "
                                          >

                                            {patient.picture
                                              ? (

                                                <img
                                                  src={
                                                    patient.picture
                                                  }
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


                                          <div
                                            className="
                                              min-w-0
                                            "
                                          >

                                            <p
                                              className="
                                                truncate
                                                text-sm
                                                font-bold
                                                text-slate-900
                                              "
                                            >
                                              {
                                                patient.fullName
                                              }
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
                                              {
                                                patient.id
                                              }
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

                                              {patient
                                                .dateOfBirth
                                                && (

                                                  <span>
                                                    DOB:{" "}
                                                    {
                                                      patient
                                                        .dateOfBirth
                                                    }
                                                  </span>

                                                )
                                              }


                                              {patient
                                                .gender
                                                && (

                                                  <span>
                                                    {
                                                      patient
                                                        .gender
                                                    }
                                                  </span>

                                                )
                                              }


                                              {patient
                                                .bloodGroup
                                                && (

                                                  <span
                                                    className="
                                                      text-rose-600
                                                    "
                                                  >
                                                    Blood:{" "}
                                                    {
                                                      patient
                                                        .bloodGroup
                                                    }
                                                  </span>

                                                )
                                              }

                                            </div>

                                          </div>

                                        </button>

                                      )
                                    )}

                                  </div>

                                )
                            }

                          </div>

                        )}

                      </div>

                    )
                  }


                  {showError(
                    "patient"
                  ) && (

                    <p
                      className="
                        mt-2
                        text-xs
                        font-medium
                        text-red-600
                      "
                    >
                      {
                        validationErrors.patient
                      }
                    </p>

                  )}

                </div>


                {/* VISIT DATE */}
                <div>

                  <label
                    className="
                      mb-1.5
                      block
                      text-sm
                      font-semibold
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
                    max={
                      today()
                    }
                    aria-invalid={
                      showError(
                        "visitDate"
                      )
                    }
                    onBlur={
                      () =>
                        markTouched(
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


                        setError(
                          ""
                        );
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
                        showError(
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


                  {showError(
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


                {/* HOSPITAL */}
                <div>

                  <label
                    className="
                      mb-1.5
                      block
                      text-sm
                      font-semibold
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
                      showError(
                        "hospitalName"
                      )
                    }
                    onBlur={
                      () =>
                        markTouched(
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


                        setError(
                          ""
                        );
                      }
                    }
                    placeholder="HealthBridge Hospital"
                    className={`
                      w-full
                      rounded-xl
                      border
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      ${
                        showError(
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

                      {showError(
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
                            validationErrors
                              .hospitalName
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
                      {
                        hospitalName.length
                      }
                      /120
                    </span>

                  </div>

                </div>


                {/* RECORD TYPE */}
                <div>

                  <label
                    className="
                      mb-1.5
                      block
                      text-sm
                      font-semibold
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
                      showError(
                        "recordType"
                      )
                    }
                    onBlur={
                      () =>
                        markTouched(
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


                        setError(
                          ""
                        );
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
                        showError(
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
                          key={
                            type
                          }
                          value={
                            type
                          }
                        >
                          {type}
                        </option>

                      )
                    )}

                  </select>


                  {showError(
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


            {/* ============================================
                CLINICAL DETAILS
                ============================================ */}
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
                Clinical Details
              </h2>


              <div
                className="
                  mt-5
                  space-y-4
                "
              >

                {/* DIAGNOSIS */}
                <div>

                  <label
                    className="
                      mb-1.5
                      block
                      text-sm
                      font-semibold
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
                      showError(
                        "diagnosis"
                      )
                    }
                    onBlur={
                      () =>
                        markTouched(
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


                        setError(
                          ""
                        );
                      }
                    }
                    placeholder="e.g. Hypertension"
                    className={`
                      w-full
                      rounded-xl
                      border
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      ${
                        showError(
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

                      {showError(
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
                      {
                        diagnosis.length
                      }
                      /150
                    </span>

                  </div>

                </div>


                {/* CLINICAL SUMMARY */}
                <div>

                  <label
                    className="
                      mb-1.5
                      block
                      text-sm
                      font-semibold
                    "
                  >
                    Clinical Summary *
                  </label>


                  <textarea
                    rows={4}
                    value={
                      clinicalSummary
                    }
                    required
                    minLength={10}
                    maxLength={2000}
                    aria-invalid={
                      showError(
                        "clinicalSummary"
                      )
                    }
                    onBlur={
                      () =>
                        markTouched(
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


                        setError(
                          ""
                        );
                      }
                    }
                    placeholder="Summarize the patient's condition, assessment and key clinical findings..."
                    className={`
                      w-full
                      rounded-xl
                      border
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      ${
                        showError(
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

                      {showError(
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
                            validationErrors
                              .clinicalSummary
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
                      {
                        clinicalSummary.length
                      }
                      /2000
                    </span>

                  </div>

                </div>

              </div>

            </section>


            {/* POST CREATION NOTE */}
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
                Additional diagnoses and treatment records
                are managed after this Medical Record is created.
              </p>


              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-blue-700
                "
              >
                After saving, use Manage Diagnoses and
                Manage Treatments on the Medical Record Details page.
              </p>

            </section>


            {/* ============================================
                CONSULTATION NOTES
                ============================================ */}
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
                  showError(
                    "consultationNotes"
                  )
                }
                onBlur={
                  () =>
                    markTouched(
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


                    setError(
                      ""
                    );
                  }
                }
                placeholder="Clinical observations, advice and follow-up notes..."
                className={`
                  mt-4
                  w-full
                  rounded-xl
                  border
                  px-3
                  py-2.5
                  text-sm
                  outline-none
                  ${
                    showError(
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

                  {showError(
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
                        validationErrors
                          .consultationNotes
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
                  {
                    consultationNotes.length
                  }
                  /5000
                </span>

              </div>

            </section>


            {/* ============================================
                FINAL CONFIRMATION
                ============================================ */}
            <div
              className="
                flex
                flex-col
                gap-4
                rounded-2xl
                border
                border-blue-100
                bg-blue-50/60
                p-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-blue-600
                  "
                >
                  Patient Confirmation
                </p>


                <p
                  className="
                    mt-1
                    text-sm
                    font-bold
                    text-slate-900
                  "
                >
                  {selectedPatient
                    ? selectedPatient.fullName
                    : "No patient selected"
                  }
                </p>


                {selectedPatient && (

                  <p
                    className="
                      mt-1
                      break-all
                      text-xs
                      text-slate-500
                    "
                  >
                    Patient ID:{" "}
                    {
                      selectedPatient.id
                    }
                  </p>

                )}


                {!formValid && (

                  <p
                    className="
                      mt-2
                      text-xs
                      text-slate-500
                    "
                  >
                    Complete all required fields correctly
                    to enable record creation.
                  </p>

                )}

              </div>


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
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                {submitting && (

                  <Loader2
                    className="
                      h-4
                      w-4
                      animate-spin
                    "
                  />

                )}


                {submitting
                  ? "Creating..."
                  : selectedPatient
                    ? (
                      `Create Record for ${
                        selectedPatient.fullName
                      }`
                    )
                    : "Create Medical Record"
                }

              </button>

            </div>

          </form>
        )}

      </div>

    </DashboardLayout>
  );
}