import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("ledger_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type LoginPayload = { email: string; password: string };
export type LoginResponse = { access_token: string; user?: { name?: string; email?: string } };

export async function login(payload: LoginPayload) {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

export async function uploadStatement(file: File) {
  const form = new FormData();
  form.append("file", file);
  return api.post("/v1/convert-to-excel", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}