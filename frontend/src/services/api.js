const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function apiFetch(endpoint, options = {}) {
  const token = sessionStorage.getItem("access_token");

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Só envia Content-Type se houver body
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("access_token");
    throw new Error("Sessão expirada");
  }

  return response;
}