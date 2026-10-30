/* Auth service: login, registration, session validation, and password change only. */
import client from "./client";
export const login = payload => client.post("/auth/login", payload);
export const register = payload => client.post("/auth/register", payload);
export const me = () => client.get("/auth/me");
export const changePassword = payload =>
  client.post("/auth/change-password", payload);
export const refresh = () => client.post("/auth/refresh");
export const logoutSession = () => client.post("/auth/logout");
export const logoutAll = () => client.post("/auth/logout-all");
