import api from "@/lib/axios";

export interface SupportDocument {
  id: string;
  category: string;
  description: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  publicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadSupportDocumentResponse
  extends SupportDocument {}

export const uploadSupportDocument = async (
  category: string,
  description: string,
  file: File
): Promise<UploadSupportDocumentResponse> => {
  const formData = new FormData();

  formData.append("category", category);
  formData.append("description", description);
  formData.append("file", file);

  const response = await api.post<UploadSupportDocumentResponse>(
    "/support/documents/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response;
};

export const getAllSupportDocuments = async (): Promise<
  SupportDocument[]
> => {
  return await api.get<SupportDocument[]>(
    "/support/documents"
  );
};

export const getSupportDocumentsByCategory = async (
  category: string
): Promise<SupportDocument[]> => {
  return await api.get<SupportDocument[]>(
    `/support/documents/category/${encodeURIComponent(category)}`
  );

  
};
export const deleteSupportDocument = async (
  id: string
): Promise<void> => {
  await api.delete(`/support/documents/${id}`);
};