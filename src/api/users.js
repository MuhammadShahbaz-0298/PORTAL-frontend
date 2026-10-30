/* Users service: account listing, mutation, activation, and deletion. */
import client from "./client";
export const listUsers = params => client.get("/users", { params });
export const updateUser = (id, payload) =>
  client.patch(`/users/${id}`, payload);
export const deleteUser = id => client.delete(`/users/${id}`);
export const resetPassword = id =>
  client.patch(`/users/${id}/reset-password`);
