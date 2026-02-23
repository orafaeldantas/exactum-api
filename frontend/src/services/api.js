const API_URL = import.meta.env.VITE_API_URL || "/api";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, isCancellation = false) => {
  failedQueue.forEach((prom) => {
    if (error) {
      if (isCancellation) {
        prom.resolve(false);
      } else {
        prom.reject(error);
      }
    } else {
      prom.resolve(true);
    }
  });
  failedQueue = [];
};

function buildHeaders(customHeaders = {}) {
  return {
    ...customHeaders,
    credentials: "include",
  };
}

async function refreshAccessToken() {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json().catch(() => ({}));

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
  const isLogoutCall = endpoint.includes("/auth/logout");

  if (
    response.status === 401 &&
    !isRefreshCall &&
    !isLoginCall &&
    !isLogoutCall
  ) {
    if (isRefreshing) {
      response = await new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(async (shouldRetry) => {
          if (shouldRetry === false) {
            return new Response(JSON.stringify({}), { status: 401 });
          }

          return await fetch(`${API_URL}${endpoint}`, fetchOptions);
        })
        .catch((err) => {
          throw err;
        });
    }

    isRefreshing = true;

    try {
      const refreshed = await refreshAccessToken();

      if (!refreshed) {
        processQueue(new Error("Session expired"), true);

        const event = new CustomEvent("auth:session-expired");
        window.dispatchEvent(event);

        throw new Error("Session expired");
      }

      processQueue(null);

      isRefreshing = false;

      response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

      if (response.status === 401) {
        const event = new CustomEvent("auth:session-expired");
        window.dispatchEvent(event);
        throw new Error("Session expired after refresh retry");
      }
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError, null);
      throw refreshError;
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
