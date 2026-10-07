import api from "@/lib/axios";

import type {
  Diagnosis,
  DiagnosisRequest,
  MedicalDocument,
  MedicalDocumentUpdateRequest,
  MedicalRecord,
  MedicalRecordRequest,
  PatientEhrHistory,
  PatientLookupResult,
  TreatmentRecord,
  TreatmentRecordRequest,
} from "@/types/medicalRecord";


function encodeId(
  value: string
): string {
  return encodeURIComponent(
    value.trim()
  );
}


function normalizeMedicalRecord(
  record: MedicalRecord
): MedicalRecord {
  return {
    ...record,

    symptoms:
      record.symptoms ?? [],

    treatmentPlan:
      record.treatmentPlan ?? [],

    archived:
      record.archived ?? false,
  };
}


function normalizeMedicalRecords(
  records: MedicalRecord[]
): MedicalRecord[] {
  return (
    records ?? []
  ).map(
    normalizeMedicalRecord
  );
}


function normalizeHistory(
  history: PatientEhrHistory
): PatientEhrHistory {
  return {
    ...history,

    medicalRecords:
      normalizeMedicalRecords(
        history.medicalRecords ?? []
      ),

    diagnoses:
      history.diagnoses ?? [],

    treatments:
      history.treatments ?? [],

    documents:
      history.documents ?? [],
  };
}


class MedicalRecordService {

  /*
   * =========================================================
   * PATIENT EHR HISTORY
   * =========================================================
   */
  async getPatientEhrHistory(
    patientId: string
  ): Promise<PatientEhrHistory> {

    const response =
      await api.get<PatientEhrHistory>(
        `/medical-records/patient/${
          encodeId(patientId)
        }/history`
      );

    return normalizeHistory(
      response
    );
  }


  /*
   * =========================================================
   * PATIENT LOOKUP
   * =========================================================
   */
  async searchPatients(
    query: string = ""
  ): Promise<PatientLookupResult[]> {

    return await api.get<
      PatientLookupResult[]
    >(
      "/medical-records/patient-lookup",
      {
        params: {
          query:
            query.trim(),
        },
      }
    );
  }


  /*
   * Current logged-in doctor's
   * existing EHR patients.
   */
  async getMyPatients():
    Promise<PatientLookupResult[]> {

    return await api.get<
      PatientLookupResult[]
    >(
      "/medical-records/my-patients"
    );
  }


  /*
   * =========================================================
   * MEDICAL RECORD
   * =========================================================
   */
  async getMedicalRecordById(
    id: string
  ): Promise<MedicalRecord> {

    const response =
      await api.get<MedicalRecord>(
        `/medical-records/${
          encodeId(id)
        }`
      );

    return normalizeMedicalRecord(
      response
    );
  }


  async createMedicalRecord(
    request: MedicalRecordRequest
  ): Promise<MedicalRecord> {

    const response =
      await api.post<MedicalRecord>(
        "/medical-records",
        request
      );

    return normalizeMedicalRecord(
      response
    );
  }


  async updateMedicalRecord(
    id: string,
    request: MedicalRecordRequest
  ): Promise<MedicalRecord> {

    const response =
      await api.put<MedicalRecord>(
        `/medical-records/${
          encodeId(id)
        }`,
        request
      );

    return normalizeMedicalRecord(
      response
    );
  }


  /*
   * =========================================================
   * DIAGNOSIS
   * =========================================================
   */
  async getDiagnosesByRecord(
    medicalRecordId: string
  ): Promise<Diagnosis[]> {

    return await api.get<
      Diagnosis[]
    >(
      `/diagnoses/record/${
        encodeId(
          medicalRecordId
        )
      }`
    );
  }


  async createDiagnosis(
    request: DiagnosisRequest
  ): Promise<Diagnosis> {

    return await api.post<Diagnosis>(
      "/diagnoses",
      request
    );
  }


  async updateDiagnosis(
    id: string,
    request: DiagnosisRequest
  ): Promise<Diagnosis> {

    return await api.put<Diagnosis>(
      `/diagnoses/${
        encodeId(id)
      }`,
      request
    );
  }


  async deleteDiagnosis(
    id: string
  ): Promise<void> {

    await api.delete<void>(
      `/diagnoses/${
        encodeId(id)
      }`
    );
  }


  /*
   * =========================================================
   * TREATMENTS
   * =========================================================
   */
  async getTreatmentsByRecord(
    medicalRecordId: string
  ): Promise<TreatmentRecord[]> {

    return await api.get<
      TreatmentRecord[]
    >(
      `/treatments/record/${
        encodeId(
          medicalRecordId
        )
      }`
    );
  }


  async createTreatment(
    request: TreatmentRecordRequest
  ): Promise<TreatmentRecord> {

    return await api.post<
      TreatmentRecord
    >(
      "/treatments",
      request
    );
  }


  async updateTreatment(
    id: string,
    request: TreatmentRecordRequest
  ): Promise<TreatmentRecord> {

    return await api.put<
      TreatmentRecord
    >(
      `/treatments/${
        encodeId(id)
      }`,
      request
    );
  }


  async deleteTreatment(
    id: string
  ): Promise<void> {

    await api.delete<void>(
      `/treatments/${
        encodeId(id)
      }`
    );
  }


  /*
   * =========================================================
   * DOCUMENTS
   * =========================================================
   */
  async getDocumentsByRecord(
    medicalRecordId: string
  ): Promise<MedicalDocument[]> {

    return await api.get<
      MedicalDocument[]
    >(
      `/medical-documents/record/${
        encodeId(
          medicalRecordId
        )
      }`
    );
  }


  async uploadDocument(
    file: File,
    medicalRecordId: string,
    patientId: string,
    documentType: string,
    description?: string
  ): Promise<MedicalDocument> {

    const formData =
      new FormData();


    formData.append(
      "file",
      file
    );


    formData.append(
      "medicalRecordId",
      medicalRecordId
    );


    formData.append(
      "patientId",
      patientId
    );


    formData.append(
      "documentType",
      documentType
    );


    if (
      description?.trim()
    ) {
      formData.append(
        "description",
        description.trim()
      );
    }


    /*
     * Do NOT manually set Content-Type.
     *
     * Browser automatically adds multipart boundary.
     */
   return await api.post<
  MedicalDocument
>(
  "/medical-documents/upload",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
);
  }


  async replaceDocument(
    id: string,
    file: File,
    description?: string
  ): Promise<MedicalDocument> {

    const formData =
      new FormData();


    formData.append(
      "file",
      file
    );


    if (
      description?.trim()
    ) {
      formData.append(
        "description",
        description.trim()
      );
    }


    return await api.put<
  MedicalDocument
>(
  `/medical-documents/${
    encodeId(
      id
    )
  }/replace`,
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
);
  }


  async archiveDocument(
    id: string
  ): Promise<MedicalDocument> {

    return await api.patch<
      MedicalDocument
    >(
      `/medical-documents/${
        encodeId(id)
      }/archive`
    );
  }


  /*
   * =========================================================
   * ARCHIVED DOCUMENTS
   *
   * ADMIN / SUPER_ADMIN
   * =========================================================
   */
  async getArchivedDocuments():
    Promise<MedicalDocument[]> {

    return await api.get<
      MedicalDocument[]
    >(
      "/medical-documents/archived"
    );
  }


  /*
   * =========================================================
   * PERMANENT DELETE ARCHIVED DOCUMENT
   *
   * SUPER_ADMIN ONLY
   * Backend also verifies that the document
   * status is ARCHIVED.
   * =========================================================
   */
  async permanentlyDeleteDocument(
    id: string
  ): Promise<void> {

    await api.delete<void>(
      `/medical-documents/${
        encodeId(id)
      }/permanent`
    );
  }


  /*
   * Optional helper if metadata edit is
   * needed later.
   */
  async updateDocumentMetadata(
    id: string,
    request:
      MedicalDocumentUpdateRequest
  ): Promise<MedicalDocument> {

    return await api.put<
      MedicalDocument
    >(
      `/medical-documents/${
        encodeId(id)
      }`,
      request
    );
  }
}


export const medicalRecordService =
  new MedicalRecordService();


export default medicalRecordService;