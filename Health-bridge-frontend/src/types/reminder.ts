export interface Reminder {
    id: string;
    prescriptionId: string;
    medicineName: string;
    dosage: string;
    instructions: string;
    scheduledDate: string;
    scheduledTime: string;
    status: string;
}
