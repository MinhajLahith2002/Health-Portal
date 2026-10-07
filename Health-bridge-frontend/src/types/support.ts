export type TicketStatus = "OPEN" | "PROCESSING" | "SOLVED";

export interface TicketFeedback {
  rating: number;
  comment: string | null;
  createdAt?: string;
}

export interface TicketReply {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "USER" | "ADMIN";
  message: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  category: string;
  contactNumber: string;
  attachmentUrl: string | null;
  status: TicketStatus;
  replies: TicketReply[];
  feedback?: TicketFeedback | null;
  feedbackRating?: number | null;
  feedbackComment?: string | null;
  feedbackCreatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketSummary {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  status: TicketStatus;
  hasAttachment: boolean;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
  feedback?: TicketFeedback | null;
  feedbackRating?: number | null;
  feedbackComment?: string | null;
  feedbackCreatedAt?: string | null;
}
