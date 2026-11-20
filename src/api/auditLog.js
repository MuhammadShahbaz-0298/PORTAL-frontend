/* Audit log service. */
import client from "./client";
export const listAuditLogs = params => client.get("/audit-log", { params });