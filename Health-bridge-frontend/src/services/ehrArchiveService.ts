import api from "@/lib/axios";

import type {
  MedicalDocument,
  MedicalRecord,
} from "@/types/medicalRecord";


function encodeId(
  value: string
): string {

  return encodeURIComponent(
    value.trim()
  );
}


class EhrArchiveService {

  /*
   * DOCTOR ONLY.
   *
   * Backend verifies:
   * authenticated doctor ==
   * MedicalRecord.doctorId
   */
  async archiveMedicalRecord(
    id: string
  ): Promise<MedicalRecord> {

    return await api.patch<
      MedicalRecord
    >(
      `/medical-records/${
        encodeId(id)
      }/archive-by-doctor`
    );
  }


  /*
   * ADMIN / SUPER_ADMIN
   */
  async getArchivedMedicalRecords():
    Promise<MedicalRecord[]> {

    return await api.get<
      MedicalRecord[]
    >(
      "/medical-records/archived"
    );
  }


  /*
   * ADMIN / SUPER_ADMIN
   */
  async restoreMedicalRecord(
    id: string
  ): Promise<MedicalRecord> {

    return await api.patch<
      MedicalRecord
    >(
      `/medical-records/${
        encodeId(id)
      }/restore`
    );
  }


  /*
   * SUPER_ADMIN ONLY.
   *
   * Backend requires Medical Record
   * to already be archived.
   */
  async permanentlyDeleteMedicalRecord(
    id: string
  ): Promise<void> {

    await api.delete<void>(
      `/medical-records/${
        encodeId(id)
      }`
    );
  }


  /*
   * ADMIN / SUPER_ADMIN
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
   * ADMIN / SUPER_ADMIN
   */
  async restoreDocument(
    id: string
  ): Promise<MedicalDocument> {

    return await api.patch<
      MedicalDocument
    >(
      `/medical-documents/${
        encodeId(id)
      }/restore`
    );
  }


  /*
   * SUPER_ADMIN ONLY.
   *
   * Backend requires document status
   * to already be ARCHIVED.
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
}


export const ehrArchiveService =
  new EhrArchiveService();


export default ehrArchiveService;