/* Small display helpers for weekly timetable entries. */
import { DAYS_OF_WEEK } from "../../constants/app";

export const days = DAYS_OF_WEEK;

export const batchName = batch =>
  typeof batch === "object" ? batch?.name || "Batch" : batch || "Batch";

export const timeRange = entry =>
  entry?.startTime || entry?.endTime
    ? `${entry.startTime || "—"} – ${entry.endTime || "—"}`
    : "Time not set";
