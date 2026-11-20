/* Report card download service. */
import client from "./client";
export const getReportCard = (id, batchId) =>
  client.get(`/users/${id}/report-card`, {
    params: batchId ? { batchId } : undefined,
    responseType: "blob",
  });