export const TICKET_CATEGORIES = [
  "APPOINTMENT",
  "BILLING",
  "PHARMACY",
  "LAB_REPORT",
  "MEDICAL_RECORD",
  "INSURANCE",
  "DOCTOR",
  "NURSE",
  "ADMISSION",
  "DISCHARGE",
  "MEDICINE",
  "TECHNICAL",
  "GENERAL",
  "COMPLAINT",
  "OTHER",
] as const;

export type TicketCategory =
  (typeof TICKET_CATEGORIES)[number];

export const TICKET_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const;

export type TicketPriority =
  (typeof TICKET_PRIORITIES)[number];

export const TICKET_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
] as const;

export type TicketStatus =
  (typeof TICKET_STATUSES)[number];