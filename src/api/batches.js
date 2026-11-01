/* Batch service: cohort creation, enrollment, and admin management. */
import client from "./client";
export const listBatches = () => client.get("/batches");
export const createBatch = payload => client.post("/batches", payload);
export const updateBatch = (id, payload) =>
  client.patch(`/batches/${id}`, payload);
export const archiveBatch = id => client.patch(`/batches/${id}/archive`);
export const deleteBatch = id => client.delete(`/batches/${id}`);
export const enrollStudent = (id, studentId) =>
  client.post(`/batches/${id}/enroll`, { studentId });
export const listBatchStudents = id => client.get(`/batches/${id}/students`);
