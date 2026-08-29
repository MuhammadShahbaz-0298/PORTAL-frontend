const COLLECTION_KEYS = Object.freeze([
  "data",
  "items",
  "records",
  "assignments",
  "submissions",
  "attendance",
  "attendanceRecords",
  "roles",
  "users",
  "batches",
]);

export function toCollection(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of COLLECTION_KEYS) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  if (payload?.data && payload.data !== payload)
    return toCollection(payload.data);
  return [];
}

export function responseError(payload) {
  return payload?.error || payload?.message || "";
}
