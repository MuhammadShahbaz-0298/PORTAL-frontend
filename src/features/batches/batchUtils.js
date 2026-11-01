/* Batch display helpers shared by the cards, modals, and page. */
export function getLearnerCount(batch) {
  const counts = [
    "studentCount",
    "learnerCount",
    "enrollmentCount",
    "studentsCount",
  ].map(key => Number(batch?.[key]) || 0);

  return Math.max(
    Array.isArray(batch?.students) ? batch.students.length : 0,
    ...counts
  );
}

export const teacherName = value =>
  typeof value === "object" && value
    ? value.name || "Teacher not assigned"
    : value || "Teacher not assigned";

export const personName = value =>
  typeof value === "object" && value
    ? value.name || "Student"
    : value || "Student";

export const personEmail = value =>
  typeof value === "object" && value ? value.email || "" : "";
