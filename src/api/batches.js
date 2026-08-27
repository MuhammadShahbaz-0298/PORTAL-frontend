/* Batch service: cohort creation and enrollment endpoints only. */
import client from './client';
export const listBatches = () => client.get('/batches');
export const createBatch = (payload) => client.post('/batches', payload);
export const enrollStudent = (id, studentId) => client.post(`/batches/${id}/enroll`, { studentId });
export const listBatchStudents = (id) => client.get(`/batches/${id}/students`);
