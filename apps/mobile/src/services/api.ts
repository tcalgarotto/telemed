const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001";

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiClient<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, config);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message ?? "Request failed");
  }

  return data.data as T;
}

// Typed API helpers
import type {
  User,
  ProfessionalWithAvailability,
  Consultation,
  Prescription,
} from "@telemed/shared";

export const usersApi = {
  getMe: () => apiClient<User>("/api/users/me"),
  updateMe: (data: Partial<User>) =>
    apiClient<User>("/api/users/me", { method: "PATCH", body: data }),
};

export const professionalsApi = {
  list: () =>
    apiClient<ProfessionalWithAvailability[]>("/api/professionals"),
  getById: (id: string) =>
    apiClient<ProfessionalWithAvailability>(`/api/professionals/${id}`),
  register: (data: unknown) =>
    apiClient("/api/professionals", { method: "POST", body: data }),
};

export const consultationsApi = {
  list: () => apiClient<Consultation[]>("/api/consultations"),
  getById: (id: string) =>
    apiClient<Consultation>(`/api/consultations/${id}`),
  book: (data: unknown) =>
    apiClient<Consultation>("/api/consultations", { method: "POST", body: data }),
  update: (id: string, data: unknown) =>
    apiClient<Consultation>(`/api/consultations/${id}`, {
      method: "PATCH",
      body: data,
    }),
  joinRoom: (id: string) =>
    apiClient<{ token: string; room_url: string; is_owner: boolean }>(
      `/api/consultations/${id}/join`,
      { method: "POST" },
    ),
};

export const prescriptionsApi = {
  list: () => apiClient<Prescription[]>("/api/prescriptions"),
  create: (data: unknown) =>
    apiClient<Prescription>("/api/prescriptions", { method: "POST", body: data }),
};

export const paymentsApi = {
  createSubscription: (data: unknown) =>
    apiClient<{ url: string }>("/api/payments", { method: "POST", body: data }),
};
