/* Assignment service: list, detail, create, update, archive. */
import client from "./client";
export const listAssignments = () => client.get("/assignments");
export const getAssignment = id => client.get(`/assignments/${id}`);
export const createAssignment = payload => client.post("/assignments", payload);
export const updateAssignment = (id, payload) =>
  client.patch(`/assignments/${id}`, payload);
export const archiveAssignment = id => client.delete(`/assignments/${id}`);
