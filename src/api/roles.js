/* Roles service: role catalog, mutation, and permission catalog only. */
import client from "./client";
export const listRoles = () => client.get("/roles");
export const createRole = payload => client.post("/roles", payload);
export const updateRole = (id, payload) =>
  client.patch(`/roles/${id}`, payload);
export const getPermissionCatalog = () => client.get("/permissions");
export const updateUserPermissions = (id, payload) =>
  client.patch(`/permissions/users/${id}`, payload);
