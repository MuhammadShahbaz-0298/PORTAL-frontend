/* Submission service: uploads, grading, downloads, and list queries. */
import client from './client';
export const listSubmissions = (params) => client.get('/submissions', { params });
const submissionForm = (assignmentId, file) => { const data = new FormData(); if (assignmentId) data.append('assignmentId', assignmentId); data.append('file', file); return data; };
export const uploadSubmission = (assignmentId, file) => client.post('/submissions', submissionForm(assignmentId, file), { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateSubmissionFile = (submissionId, file) => client.patch(`/submissions/${submissionId}/file`, submissionForm('', file), { headers: { 'Content-Type': 'multipart/form-data' } });
export const gradeSubmission = (id, payload) => client.patch(`/submissions/${id}/grade`, payload);
export const downloadSubmission = (id) => client.get(`/submissions/${id}/download`, { responseType: 'blob' });
