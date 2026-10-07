const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8088"
).replace(/\/api\/?$/, "");

export interface Notification {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  referenceType: string;
  referenceId: string;
  read: boolean;
  createdAt: string;
}

function getToken() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("healthbridge_token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const response = await fetch(
    `${API_BASE}/api/notifications${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...(options.headers || {}),
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Request failed with status ${response.status}`
    );
  }

  const payload = await response.json();

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

export async function getNotifications() {
  return request<Notification[]>("");
}

export async function getUnreadNotificationCount() {
  const result = await request<{ count: number }>("/unread-count");
  return result.count;
}

export async function markNotificationAsRead(id: string) {
  return request<Notification>(`/${id}/read`, {
    method: "PATCH",
  });
}