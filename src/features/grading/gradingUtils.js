/* Grading display helpers shared by the queue, cards, and editor. */
export const personName = value =>
  typeof value === "object" && value
    ? value.name || "Learner"
    : value || "Learner";

export const personEmail = value =>
  typeof value === "object" && value ? value.email || "" : "";

export const assignmentName = value =>
  typeof value === "object" && value
    ? value.title || "Assignment"
    : value || "Assignment";

export const formatDate = value => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
};
