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

export function normalizePeople(payload) {
  if (Array.isArray(payload)) return payload;
  return payload?.students || payload?.items || [];
}
