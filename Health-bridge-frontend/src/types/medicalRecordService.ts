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

  /*
   * Optional compatibility fields.
   * Current frontend does not depend on these.
   */
  cloudinaryPublicId?: string;
  cloudinaryResourceType?: string;
}


export interface PatientEhrHistory {
  patientId: string;
  generatedAt: string;

  medicalRecords: MedicalRecord[];
  diagnoses: Diagnosis[];
  treatments: TreatmentRecord[];
  documents: MedicalDocument[];
}


export interface PatientLookupResult {
  id: string;
  fullName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  picture?: string | null;
}


/*
 * =========================================================
 * MEDICAL RECORD REQUEST
 * =========================================================
 *
 * doctorId and doctorName are intentionally NOT sent.
 * Backend takes them from JWT.
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
 *
 * doctorId is intentionally NOT sent.
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
 *
 * doctorId is intentionally NOT sent.
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
 * DOCUMENT METADATA UPDATE
 * =========================================================
 */
export interface MedicalDocumentUpdateRequest {
  documentType?: string;
  description?: string;
}


/*
 * =========================================================
 * DOCUMENT UPLOAD
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
 * DOCUMENT REPLACEMENT
 * =========================================================
 */
export interface MedicalDocumentReplaceRequest {
  file: File;
  description?: string;
}