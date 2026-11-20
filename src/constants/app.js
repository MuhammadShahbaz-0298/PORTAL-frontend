/* Shared timings so pages and components never hard-code a duration. */
export const TOAST_DURATION_MS = 5000;
export const DRAFT_POLL_INTERVAL_MS = 5000;
export const DRAFT_POLL_TIMEOUT_MS = 3 * 60 * 1000;
export const NOTIFICATION_POLL_INTERVAL_MS = 30000;
export const GLOBAL_SEARCH_DEBOUNCE_MS = 300;
export const GLOBAL_SEARCH_MIN_QUERY_LENGTH = 2;
export const GLOBAL_SEARCH_RESULTS_PER_GROUP = 5;
export const QUIZ_MAX_TIME_LIMIT_MINUTES = 1440;
// Matches the backend DAYS_OF_WEEK enum in PORTAL-backend/constants/index.js.
export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
