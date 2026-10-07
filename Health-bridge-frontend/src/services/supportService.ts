import { Ticket, TicketStatus, TicketSummary } from "@/types/support";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8088"
).replace(/\/api\/?$/, "");

// Get JWT token from localStorage
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("healthbridge_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;

    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      // Response wasn't JSON
    }

    throw new Error(message);
  }

  const payload = await res.json();

  if (
    payload &&
    typeof payload === "object" &&
    payload.success === true &&
    Object.prototype.hasOwnProperty.call(payload, "data")
  ) {
    return payload.data as T;
  }

  return payload as T;
}

function normalizeTicketFeedback(ticket: Ticket): Ticket {
  const raw = ticket as Ticket & {
    supportFeedback?: Ticket["feedback"];
    rating?: number | null;
    comment?: string | null;
    feedbackSubmittedAt?: string | null;
  };

  const feedback = raw.feedback ?? raw.supportFeedback ?? (
    raw.feedbackRating != null || raw.rating != null
      ? {
          rating: raw.feedbackRating ?? raw.rating ?? 0,
          comment: raw.feedbackComment ?? raw.comment ?? null,
          createdAt: raw.feedbackCreatedAt ?? raw.feedbackSubmittedAt ?? undefined,
        }
      : null
  );

  return { ...ticket, feedback };
}

function normalizeTicketSummaryFeedback(summary: TicketSummary): TicketSummary {
  const raw = summary as TicketSummary & {
    supportFeedback?: TicketSummary["feedback"];
    rating?: number | null;
    comment?: string | null;
    feedbackSubmittedAt?: string | null;
  };

  const feedback = raw.feedback ?? raw.supportFeedback ?? (
    raw.feedbackRating != null || raw.rating != null
      ? {
          rating: raw.feedbackRating ?? raw.rating ?? 0,
          comment: raw.feedbackComment ?? raw.comment ?? null,
          createdAt: raw.feedbackCreatedAt ?? raw.feedbackSubmittedAt ?? undefined,
        }
      : null
  );

  return { ...summary, feedback };
}

// ---------- User endpoints ----------

export function createTicket(
  subject: string,
  description: string,
  category: string,
  contactNumber: string,
  attachment?: File | null
) {
  const formData = new FormData();

  formData.append("subject", subject);
  formData.append("description", description);
  formData.append("category", category);
  formData.append("contactNumber", contactNumber);

  if (attachment) {
    formData.append("attachment", attachment);
  }

  return request<Ticket>("/api/tickets", {
    method: "POST",
    body: formData,
  });
}

export function getMyTickets() {
  return request<TicketSummary[]>("/api/tickets");
}

export function getMyTicketById(id: string) {
  return request<Ticket>(`/api/tickets/${id}`).then(normalizeTicketFeedback);
}

export function replyAsUser(
  id: string,
  message: string,
  image?: File | null
) {
  const formData = new FormData();

  if (message) {
    formData.append("message", message);
  }

  if (image) {
    formData.append("image", image);
  }

  return request<Ticket>(`/api/tickets/${id}/reply`, {
    method: "POST",
    body: formData,
  });
}

export function submitTicketFeedback(
  ticketId: string,
  rating: number,
  comment: string
) {
  return request<Ticket>(`/api/tickets/${ticketId}/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rating, comment }),
  }).then(normalizeTicketFeedback);
}


export interface PublicFeedback {
  userName: string;
  rating: number;
  comment?: string | null;
  submittedAt?: string | null;
}

export function getPublicFeedback() {
  return request<PublicFeedback[]>("/api/tickets/feedback/public").catch((error) => {
    if (error instanceof Error && error.message.startsWith("No static resource api/tickets/feedback/public")) {
      return [];
    }
    throw error;
  });
}

// ---------- Admin endpoints ----------

export function getAllTickets() {
  return request<TicketSummary[]>("/api/admin/tickets").then((summaries) =>
    summaries.map(normalizeTicketSummaryFeedback)
  );
}

export function getTicketByIdForAdmin(id: string) {
  return request<Ticket>(`/api/admin/tickets/${id}`).then(normalizeTicketFeedback);
}

export function updateTicketStatus(
  id: string,
  status: TicketStatus
) {
  return request<Ticket>(`/api/admin/tickets/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
}

export function replyAsAdmin(
  id: string,
  message: string,
  image?: File | null
) {
  const formData = new FormData();

  if (message) {
    formData.append("message", message);
  }

  if (image) {
    formData.append("image", image);
  }

  return request<Ticket>(`/api/admin/tickets/${id}/reply`, {
    method: "POST",
    body: formData,
  });
}

function updateReply(path: string, message: string) {
  return request<Ticket>(path, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
}

function deleteReply(path: string) {
  return request<Ticket>(path, { method: "DELETE" });
}

export function editReplyAsUser(ticketId: string, replyId: string, message: string) {
  return updateReply(`/api/tickets/${ticketId}/reply/${replyId}`, message);
}

export function deleteReplyAsUser(ticketId: string, replyId: string) {
  return deleteReply(`/api/tickets/${ticketId}/reply/${replyId}`);
}

export function editReplyAsAdmin(ticketId: string, replyId: string, message: string) {
  return updateReply(`/api/admin/tickets/${ticketId}/reply/${replyId}`, message);
}

export function deleteReplyAsAdmin(ticketId: string, replyId: string) {
  return deleteReply(`/api/admin/tickets/${ticketId}/reply/${replyId}`);
}
