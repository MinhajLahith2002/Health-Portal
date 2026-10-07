export type TestPriority = "ROUTINE" | "URGENT" | "STAT";
export type TestStatus = "REQUESTED" | "SAMPLE_COLLECTED" | "PROCESSING" | "COMPLETED" | "CANCELLED";
export type SampleStatus = "PENDING" | "COLLECTED" | "IN_TRANSIT" | "RECEIVED" | "REJECTED";
export type ResultStatus = "DRAFT" | "VERIFIED" | "PUBLISHED";

export interface LabTest {
    id: string;
    testOrderNumber: string | null;
    patientId: string;
    doctorId: string;
    hospitalId: string;
    requestedTests: string[];
    priority: TestPriority;
    status: TestStatus;
    homeCollectionRequested: boolean;
    clinicalNotes: string;
    requestedAt: string;
    updatedAt: string | null;
}

export interface LabSample {
    id: string;
    testOrderId: string;
    barcodeId: string;
    sampleType: string;
    collectedBy: string;
    collectionLocation: string;
    status: SampleStatus;
    collectedAt: string | null;
    receivedAt: string | null;
    rejectionReason: string | null;
}

export interface ResultParameter {
    parameterName: string;
    value: string;
    unit: string;
    referenceRange: string;
    outOfRange: boolean;
}

export interface LabResult {
    id: string;
    testOrderId: string;
    sampleId: string;
    patientId: string;
    parameters: ResultParameter[];
    critical: boolean;
    abnormal: boolean;
    verifiedBy: string;
    status: ResultStatus;
    resultedAt: string;
    publishedAt: string | null;
}