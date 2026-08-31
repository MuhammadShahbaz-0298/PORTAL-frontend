export function getAssignmentStatus(assignment, now = new Date()) {
  if (assignment.active === false) return "Closed";
  if (assignment.dueDate && new Date(assignment.dueDate).getTime() <= now.getTime())
    return "Expired";
  return "Active";
}

export function isAssignmentExpired(assignment, now = new Date()) {
  return Boolean(
    assignment?.dueDate &&
      new Date(assignment.dueDate).getTime() <= now.getTime()
  );
}

export function normalizeAssignments(payload) {
  if (Array.isArray(payload)) return payload;
  return payload?.assignments || payload?.items || [];
}
