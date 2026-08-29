/* Users service: account listing, mutation, and deactivation only. */
import client from "./client";
export const listUsers = params => client.get("/users", { params });
export const updateUser = (id, payload) =>
  client.patch(`/users/${id}`, payload);
export const deactivateUser = id => client.delete(`/users/${id}`);
