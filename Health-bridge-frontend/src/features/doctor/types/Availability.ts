export type AvailabilityStatus = "Available" | "Unavailable";

export interface Availability {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AvailabilityStatus;
}

export type AvailabilityInput = Omit<Availability, "id">;
