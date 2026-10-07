export interface MedicalRecord {
  id: string;

  patientId: string;

  doctorId: string;
  doctorName: string;

  hospitalName: string;

  visitDate: string;
  recordType: string;

  diagnosis: string;
  clinicalSummary: string;

  symptoms: string[];
  treatmentPlan: string[];

  consultationNotes?: string | null;

  status: string;

  version: number;

  createdAt: string;
  updatedAt: string;

  archived: boolean;
  archivedAt?: string | null;
}


export interface Diagnosis {
  id: string;

  medicalRecordId: string;

  patientId: string;
  doctorId: string;

  diagnosisName: string;

  description?: string | null;
  severity?: string | null;

  diagnosedDate: string;
}


export interface TreatmentRecord {
  id: string;

  medicalRecordId: string;

  patientId: string;
  doctorId: string;

  treatmentType: string;

  description?: string | null;

  startDate: string;
  endDate?: string | null;

  status?: string | null;
}


export type MedicalDocumentStatus =
  | "ACTIVE"
  | "SUPERSEDED"
  | "ARCHIVED";


export interface MedicalDocument {
  id: string;

  medicalRecordId: string;

  patientId: string;
  doctorId: string;

  documentGroupId: string;

  version: number;

  status: MedicalDocumentStatus;

  documentType: string;

  fileName: string;
  contentType: string;
  fileSize: number;

  fileUrl: string;

  description?: string | null;

  uploadedAt: string;

  updatedAt?: string | null;
  archivedAt?: string | null;

  cloudinaryPublicId?: string;
  cloudinaryResourceType?: string;
}


/*
 * =========================================================
 * PATIENT LOOKUP
 * =========================================================
 */
export interface PatientLookupResult {
  id: string;

  fullName: string;

  dateOfBirth?: string | null;

  gender?: string | null;

  bloodGroup?: string | null;

  picture?: string | null;

  /*
   * Available for:
   * Doctor -> My EHR Patients
   */
  lastVisitDate?: string | null;

  recordCount?: number | null;
}


/*
 * =========================================================
 * UNIFIED PATIENT HISTORY
 * =========================================================
 */
export interface PatientEhrHistory {
  patientId: string;

  generatedAt: string;

  medicalRecords: MedicalRecord[];

  diagnoses: Diagnosis[];

  treatments: TreatmentRecord[];

  documents: MedicalDocument[];
}


/*
 * =========================================================
 * MEDICAL RECORD REQUEST
 *
 * doctorId and doctorName are intentionally NOT included.
 *
 * Backend gets doctor identity from JWT.
 * =========================================================
 */
export interface MedicalRecordRequest {
  patientId: string;

  hospitalName: string;

  visitDate: string;

  recordType: string;

  diagnosis: string;

  clinicalSummary: string;

  symptoms?: string[];

  treatmentPlan?: string[];

  consultationNotes?: string;

  status?: string;
}


/*
 * =========================================================
 * DIAGNOSIS REQUEST
 * =========================================================
 */
export interface DiagnosisRequest {
  medicalRecordId: string;

  patientId: string;

  diagnosisName: string;

  description?: string;

  severity?: string;

  diagnosedDate: string;
}


/*
 * =========================================================
 * TREATMENT REQUEST
 * =========================================================
 */
export interface TreatmentRecordRequest {
  medicalRecordId: string;

  patientId: string;

  treatmentType: string;

  description?: string;

  startDate: string;

  endDate?: string;

  status?: string;
}


/*
 * =========================================================
 * DOCUMENT UPDATE REQUEST
 * =========================================================
 */
export interface MedicalDocumentUpdateRequest {
  documentType?: string;

  description?: string;
}


/*
 * =========================================================
 * DOCUMENT UPLOAD REQUEST
 * =========================================================
 */
export interface MedicalDocumentUploadRequest {
  file: File;

  medicalRecordId: string;

  patientId: string;

  documentType: string;

  description?: string;
}


/*
 * =========================================================
 * DOCUMENT REPLACE REQUEST
 * =========================================================
 */
export interface MedicalDocumentReplaceRequest {
  file: File;

  description?: string;
}