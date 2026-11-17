export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Centralized API client for Matchwize frontend
 * - Automatically prepends API_BASE_URL for relative endpoints
 * - Automatically attaches Bearer token from localStorage
 * - Intercepts HTTP 401 Unauthorized responses to clear expired credentials and redirect to login
 * - Preserves standard fetch Response contract (response.ok, response.json(), etc.)
 * - Skips redirect on login/register endpoints so failed credentials can be handled by the UI
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("http://") || endpoint.startsWith("https://")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = { ...(options.headers || {}) };
  const token = localStorage.getItem("token");

  if (token && !headers["Authorization"] && !headers["authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  const response = await fetch(url, fetchOptions);

  const isAuthRoute =
    url.includes("/api/auth/login") ||
    url.includes("/api/auth/register");

  if (response.status === 401 && !isAuthRoute) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/" &&
      window.location.pathname !== "/register"
    ) {
      window.location.href = "/";
    }
  }

  return response;
}

export default apiFetch;
