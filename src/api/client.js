import axios from "axios";
import { env } from "../config/env";

const client = axios.create({
  baseURL: env.apiUrl,
  headers: { Accept: "application/json" },
});

client.interceptors.request.use(request => {
  const token = localStorage.getItem("school_portal_token");
  if (token) request.headers.Authorization = `Bearer ${token}`;
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
  error => Promise.reject(error)
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
