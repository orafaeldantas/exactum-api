const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function apiFetch(url, options = {}) {
  const token = sessionStorage.getItem("access_token");

  const headers = {
    ...options.headers,
    Authorization: token
      ? `Bearer ${token}`
      : undefined,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}