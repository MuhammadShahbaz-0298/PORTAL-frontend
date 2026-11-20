/* Attendance service: register reads and writes only. */
import client from "./client";
export const listAttendance = params => client.get("/attendance", { params });
export const markAttendance = payload => client.post("/attendance", payload);
export const exportAttendance = () =>
  client.get("/attendance/export", { responseType: "blob" });
