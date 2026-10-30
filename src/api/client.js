import axios from "axios";
import { env } from "../config/env";
import { store } from "../store";
import { logout } from "../store/actions/authActions";

const UNSAFE_METHODS = new Set(["post", "put", "patch", "delete"]);
const MUST_CHANGE_PASSWORD_MESSAGE =
  "You must change your password before continuing.";

let refreshPromise = null;

const client = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

client.interceptors.request.use(request => {
  const method = String(request.method || "get").toLowerCase();
  if (UNSAFE_METHODS.has(method)) {
    request.headers["x-csrf-protection"] = "1";
  }
  return request;
});

client.interceptors.response.use(
  response => {
    // Support the standardized `{ success, data }` envelope while keeping legacy endpoints compatible.
    if (
      response.data?.success === true &&
      Object.prototype.hasOwnProperty.call(response.data, "data")
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  async error => {
    const status = error.response?.status;
    const message =
      error.response?.data?.error || error.response?.data?.message;
    const originalRequest = error.config;

    if (status === 403 && message === MUST_CHANGE_PASSWORD_MESSAGE && window.location.pathname !== "/force-change-password" ) {
      window.location.replace("/force-change-password");
      return Promise.reject(error);
    }

    if (status === 401) {
      if (originalRequest?.skipAuthRefresh) return Promise.reject(error);

      if (!originalRequest || originalRequest.retry) {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      originalRequest.retry = true;

      if (!refreshPromise) {
        refreshPromise = client
          .post("/auth/refresh", null, { skipAuthRefresh: true })
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        await refreshPromise;
      } catch {
        store.dispatch(logout());
        return Promise.reject(error);
      }

      return client(originalRequest);
    }

    return Promise.reject(error);
  }
);

export const apiError = error => {
  if (error?.code === "ERR_NETWORK" || !error?.response) {
    return "Unable to reach the portal service. Check that the server is running and try again.";
  }

  const payload = error.response?.data;
  if (Array.isArray(payload?.details) && payload.details.length)
    return payload.details.join(" ");
  return (
    payload?.error ||
    payload?.message ||
    "Something went wrong while completing that request."
  );
};

export default client;
