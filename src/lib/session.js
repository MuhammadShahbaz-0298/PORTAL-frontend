/* Idle-session helpers: the cookie carries auth, so only the last activity time is stored. */
export const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;

// Why: mousemove fires dozens of times a second; writing storage that often is wasted work.
export const ACTIVITY_WRITE_INTERVAL_MS = 30 * 1000;

const LAST_ACTIVITY_KEY = "school_portal_last_activity";

let lastActivityAt = 0;
let lastPersistedAt = 0;

export function touchSession({ force = false } = {}) {
  const now = Date.now();
  lastActivityAt = now;

  if (!force && now - lastPersistedAt < ACTIVITY_WRITE_INTERVAL_MS) {
    return false;
  }

  localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
  lastPersistedAt = now;
  return true;
}

export function clearSession() {
  lastActivityAt = 0;
  lastPersistedAt = 0;
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}

export function isSessionExpired() {
  const stored = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || 0);
  // Why: the in-memory stamp stays exact even while storage writes are throttled.
  const last = Math.max(stored, lastActivityAt);
  if (!last) return false;
  return Date.now() - last > INACTIVITY_TIMEOUT_MS;
}
