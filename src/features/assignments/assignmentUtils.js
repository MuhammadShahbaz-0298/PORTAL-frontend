export function getAssignmentStatus(assignment, now = new Date()) {
  if (assignment.active === false) return "Closed";
  if (
    assignment.dueDate &&
    new Date(assignment.dueDate).getTime() <= now.getTime()
  )
    return "Expired";
  return "Active";
}

/* New and older assignments without the field follow the backend default. */
export function resubmissionPolicyLabel(assignment) {
  return assignment?.resubmissionPolicy === "disabled"
    ? "Replacements not allowed"
    : "Replacements allowed";
}

export function formatDateTime(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
