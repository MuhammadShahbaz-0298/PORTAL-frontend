/* Attendance service: register reads, writes, edits, and summaries only. */
import client from "./client";
export const listAttendance = params => client.get("/attendance", { params });
export const markAttendance = payload => client.post("/attendance", payload);
export const updateAttendance = (id, payload) =>
  client.patch(`/attendance/${id}`, payload);
export const getAttendanceSummary = (studentId, params) =>
  client.get(`/attendance/${studentId}`, { params });
