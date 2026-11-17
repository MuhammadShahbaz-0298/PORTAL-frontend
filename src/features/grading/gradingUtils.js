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

/* The queue only flags drafts that are ready, still running, or failed. */
export const aiDraftBadge = submission => {
  const status = submission?.aiDraft?.status;
  if (status === "ready") return { label: "Draft ready", tone: "brand" };
  if (status === "pending") return { label: "Drafting...", tone: "neutral" };
  if (status === "failed") return { label: "Draft failed", tone: "danger" };
  return null;
};

/* Strengths and improvements may arrive as a list or as one paragraph. */
export const draftItems = value => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
};

/* Suggested marks are only usable when the backend sent a real number. */
export const draftMarks = draft => {
  const value = draft?.suggestedMarks;
  if (value === null || value === undefined || value === "") return null;
  const marks = Number(value);
  if (!Number.isFinite(marks)) return null;
  // Keep the same 0-100, two-decimal rule the manual marks field uses.
  return Math.round(Math.min(100, Math.max(0, marks)) * 100) / 100;
};

export const formatDate = value => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
};
