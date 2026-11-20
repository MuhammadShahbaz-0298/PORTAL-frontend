/* Assignment resources: list, FormData upload, blob download, archive. */
import client from "./client";

export const listAssignmentResources = assignmentId =>
  client.get(`/assignments/${assignmentId}/resources`);

export const uploadAssignmentResource = (assignmentId, file) => {
  const form = new FormData();
  form.append("resource", file);
  return client.post(`/assignments/${assignmentId}/resources`, form);
};

export const downloadAssignmentResource = (assignmentId, resourceId) =>
  client.get(`/assignments/${assignmentId}/resources/${resourceId}/download`, {
    responseType: "blob",
  });

export const archiveAssignmentResource = (assignmentId, resourceId) =>
  client.delete(`/assignments/${assignmentId}/resources/${resourceId}`);
