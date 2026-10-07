export type EmergencyType = 'Chest Pain' | 'Breathing Issue' | 'Severe Injury' | 'Other';

export interface PatientInfo {
  name: string;
  id: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
}

export interface LocationInfo {
  address: string;
  latitude?: number;
  longitude?: number;
  estimatedArrivalMins: {
    min: number;
    max: number;
  };
}
