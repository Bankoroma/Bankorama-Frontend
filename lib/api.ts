import axios, { AxiosError } from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("ledger_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Session expirée ou token invalide : retour à la connexion
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthCall = error.config?.url?.startsWith("/auth/login");
    if (error.response?.status === 401 && !isAuthCall && typeof window !== "undefined") {
      localStorage.removeItem("ledger_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Message lisible depuis une erreur API (y compris réponse blob du téléchargement)
export async function apiErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback;
  if (!error.response) return "Impossible de contacter l'API. Vérifiez votre connexion.";

  let data: unknown = error.response.data;
  if (data instanceof Blob) {
    try {
      data = JSON.parse(await data.text());
    } catch {
      return fallback;
    }
  }

  const detail = (data as { detail?: unknown })?.detail;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object" && "message" in detail) {
    const d = detail as { message: string; credits_required?: number; credits_available?: number };
    if (d.credits_required !== undefined) {
      return `${d.message} Ce relevé nécessite ${d.credits_required} crédit(s), il vous en reste ${d.credits_available}.`;
    }
    return d.message;
  }
  if (Array.isArray(detail)) return "Certains champs sont invalides.";
  return fallback;
}

// ---------- Types ----------

export type Plan = {
  code: string;
  name: string;
  price_ttc: string;
  monthly_credits: number;
};

export type SubscriptionStatus = "pending" | "active" | "suspended";

export type CurrentUser = {
  id: number;
  raison_sociale: string;
  email: string;
  credits: number;
  role: "user" | "admin";
  subscription_status: SubscriptionStatus;
  subscription_activated_at: string | null;
  credits_renew_at: string | null;
  plan: Plan | null;
};

export type Conversion = {
  id: number;
  filename: string;
  pages: number;
  credits_used: number;
  status: "success" | "failed";
  created_at: string;
};

export type AdminUser = CurrentUser & {
  is_active: boolean;
  created_at: string;
  conversions_count: number;
};

// ---------- Auth ----------

export type LoginPayload = { email: string; password: string };
export type LoginResponse = { access_token: string };

export async function login(payload: LoginPayload) {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

export type RegisterPayload = {
  raison_sociale: string;
  email: string;
  password: string;
  confirm_password: string;
  plan_code: string;
};

export async function register(payload: RegisterPayload) {
  const response = await api.post("/auth/register", payload);
  return response.data;
}

export async function getMe() {
  const response = await api.get<CurrentUser>("/auth/me");
  return response.data;
}

// ---------- Plans & conversions ----------

export async function getPlans() {
  const response = await api.get<Plan[]>("/plans");
  return response.data;
}

export async function getConversions(limit = 50) {
  const response = await api.get<Conversion[]>("/conversions", { params: { limit } });
  return response.data;
}

export async function uploadStatement(file: File, onUploadProgress?: (percent: number) => void) {
  const form = new FormData();
  form.append("file", file);

  const response = await api.post("/v1/convert-to-excel", form, {
    headers: { "Content-Type": "multipart/form-data" },
    responseType: "blob", // <-- indispensable pour recevoir un fichier binaire correctement
    // L'extraction par l'IA peut prendre plusieurs minutes sur un long relevé
    timeout: 5 * 60 * 1000,
    onUploadProgress: (event) => {
      if (event.total) onUploadProgress?.(Math.round((event.loaded / event.total) * 100));
    },
  });

  // Récupérer le nom du fichier depuis le header envoyé par le backend
  const contentDisposition = response.headers["content-disposition"];
  const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
  const filename = filenameMatch?.[1] || "conversion.xlsx";

  // Déclencher le téléchargement dans le navigateur
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return {
    filename,
    creditsConsumed: Number(response.headers["x-credits-consumed"] || 0),
    creditsRemaining: Number(response.headers["x-credits-remaining"] || 0),
    pagesProcessed: Number(response.headers["x-pages-processed"] || 0),
  };
}

// ---------- Administration ----------

export async function adminListUsers(status?: SubscriptionStatus) {
  const response = await api.get<AdminUser[]>("/admin/users", {
    params: status ? { subscription_status: status } : undefined,
  });
  return response.data;
}

export async function adminActivate(userId: number, planCode?: string) {
  const response = await api.post<AdminUser>(`/admin/users/${userId}/activate`, {
    plan_code: planCode || null,
  });
  return response.data;
}

export async function adminSuspend(userId: number) {
  const response = await api.post<AdminUser>(`/admin/users/${userId}/suspend`);
  return response.data;
}

// ---------- Formatage ----------

export function formatPrice(value: string | number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(value));
}

export function formatDate(value: string | null, withTime = false) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  pending: "En attente d'activation",
  active: "Actif",
  suspended: "Suspendu",
};
