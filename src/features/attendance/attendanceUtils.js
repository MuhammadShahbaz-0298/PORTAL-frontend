/* Attendance display helpers shared by the list, cards, and register modal. */
export const studentName = value =>
  typeof value === "object" && value
    ? value.name || "Student"
    : value || "Student";

export const studentEmail = value =>
  typeof value === "object" && value ? value.email || "" : "";

export const batchName = value =>
  typeof value === "object" && value
    ? value.name || "Deleted batch"
    : value || "Deleted batch";

export const formatDate = value => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
};

export const studentIdOf = value =>
  typeof value === "object" && value ? value._id || value.id : value;
