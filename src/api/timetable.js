/* Timetable service: weekly schedule entries, scoped by the backend. */
import client from "./client";

export const listTimetable = params => client.get("/timetable", { params });
export const createTimetableEntry = payload => client.post("/timetable", payload);
export const updateTimetableEntry = (id, payload) =>
  client.patch(`/timetable/${id}`, payload);
export const archiveTimetableEntry = id =>
  client.patch(`/timetable/${id}/archive`);
