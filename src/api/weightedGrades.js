/* Weighted grade service. */
import client from "./client";
export const getWeightedGrade = (studentId, batchId) =>
  client.get(`/weighted-grades/${studentId}`, { params: { batchId } });