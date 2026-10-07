import api from "@/lib/axios";


function encodeId(
  value: string
): string {

  return encodeURIComponent(
    value.trim()
  );
}


function safeFilePart(
  value: string
): string {

  return (
    value
      .trim()
      .replace(
        /[^a-zA-Z0-9_-]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )
    || "patient"
  );
}


class MedicalRecordPdfService {

  async downloadPatientPdf(
    patientId: string,
    patientName?: string
  ): Promise<void> {

    const normalizedPatientId =
      patientId.trim();


    if (!normalizedPatientId) {

      throw new Error(
        "Patient ID is required."
      );
    }


    /*
     * Request PDF as Blob.
     *
     * Existing axios client automatically
     * adds JWT token.
     */
    const pdfBlob =
      await api.get<Blob>(
        `/medical-records/pdf/patient/${
          encodeId(
            normalizedPatientId
          )
        }`,
        {
          responseType: "blob",
        }
      );


    /*
     * Make sure browser receives a real Blob.
     */
    const blob =
      pdfBlob instanceof Blob
        ? pdfBlob
        : new Blob(
            [pdfBlob],
            {
              type: "application/pdf",
            }
          );


    /*
     * Friendly PDF filename.
     */
    const fileName =
      patientName?.trim()
        ? `healthbridge-medical-record-${
            safeFilePart(
              patientName
            )
          }.pdf`
        : `healthbridge-medical-record-${
            safeFilePart(
              normalizedPatientId
            )
          }.pdf`;


    /*
     * Create browser download.
     */
    const objectUrl =
      URL.createObjectURL(
        blob
      );


    try {

      const anchor =
        document.createElement(
          "a"
        );


      anchor.href =
        objectUrl;


      anchor.download =
        fileName;


      anchor.style.display =
        "none";


      document.body.appendChild(
        anchor
      );


      anchor.click();


      anchor.remove();


    } finally {

      URL.revokeObjectURL(
        objectUrl
      );
    }
  }
}


export const medicalRecordPdfService =
  new MedicalRecordPdfService();


export default medicalRecordPdfService;