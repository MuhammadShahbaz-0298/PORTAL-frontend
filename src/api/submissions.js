/* Submission service: uploads, grading, downloads, and list queries. */
import client from "./client";
export const listSubmissions = params => client.get("/submissions", { params });
const submissionForm = (assignmentId, file) => {
  const data = new FormData();
  if (assignmentId) data.append("assignmentId", assignmentId);
  data.append("file", file);
  return data;
};
export const uploadSubmission = (assignmentId, file, onUploadProgress) =>
  client.post("/submissions", submissionForm(assignmentId, file), {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
export const updateSubmissionFile = (submissionId, file, onUploadProgress) =>
  client.patch(`/submissions/${submissionId}/file`, submissionForm("", file), {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
export const saveSubmissionFile = ({
  assignmentId,
  submissionId,
  file,
  onUploadProgress,
}) =>
  submissionId
    ? updateSubmissionFile(submissionId, file, onUploadProgress)
    : uploadSubmission(assignmentId, file, onUploadProgress);
export const gradeSubmission = (id, payload) =>
  client.patch(`/submissions/${id}/grade`, payload);
// AI drafts are teacher/admin only; the client already adds the CSRF header.
export const generateAiDraft = id => client.post(`/submissions/${id}/ai-draft`);
export const discardAiDraft = id =>
  client.patch(`/submissions/${id}/ai-draft/discard`);
export const downloadSubmission = (id, onDownloadProgress) =>
  client.get(`/submissions/${id}/download`, {
    responseType: "blob",
    onDownloadProgress,
  });
export const exportSubmissions = () =>
  client.get("/submissions/export", { responseType: "blob" });
export const listSubmissionVersions = submissionId =>
  client.get(`/submissions/${submissionId}/versions`);
