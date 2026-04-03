const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const ENV = {
  API_URL: API_URL_BASE.endsWith("/api") ? API_URL_BASE : `${API_URL_BASE.replace(/\/$/, "")}/api`,
} as const;
