const API_URL = import.meta.env.VITE_API_URL || "/api";

function buildHeaders(customHeaders = {}) {
  return {
    ...customHeaders,
    credentials: "include",
  };
}

async function refreshAccessToken() {
  const response = await fetch("/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();

  return true;
}

export async function apiFetch(endpoint, options = {}) {
  const defaultHeaders = options.body
    ? { "Content-Type": "application/json" }
    : {};

  const fetchOptions = {
    ...options,
    headers: buildHeaders({
      ...defaultHeaders,
      ...options.headers,
    }),
  };

  let response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

  const isRefreshCall = endpoint.includes("/auth/refresh");
  const isLoginCall = endpoint.includes("/auth/login");

  if (response.status === 401 && !isRefreshCall && !isLoginCall) {
    const refreshed = await refreshAccessToken();

    if (!refreshed) {
      throw new Error("Session expired");
    }

    const retryOptions = {
      ...options,
      headers: buildHeaders({
        ...defaultHeaders,
        ...options.headers,
      }),
    };

    response = await fetch(`${API_URL}${endpoint}`, retryOptions);

    if (response.status === 401) {
      throw new Error("Session expired after refresh retry");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    const backendMessage =
      errorData.error ||
      errorData.message ||
      `HTTP error! status: ${response.status}`;

    const error = new Error(backendMessage);

    error.status = response.status;
    error.response = response;
    error.data = errorData;

    throw error;
  }

  if (response.status === 204) {
    return 204;
  }

  return response;
}
