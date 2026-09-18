// Vite exposes only environment variables prefixed with VITE_ to the client.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
