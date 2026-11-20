/* Comments service: scoped to a submission. */
import client from "./client";
export const listComments = submissionId => client.get(`/submissions/${submissionId}/comments`);
export const createComment = (submissionId, payload) => client.post(`/submissions/${submissionId}/comments`, payload);
export const archiveComment = (submissionId, id) => client.patch(`/submissions/${submissionId}/comments/${id}/archive`);