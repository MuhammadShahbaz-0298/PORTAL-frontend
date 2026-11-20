/* Dashboard date helpers: keep event and deadline labels consistent.
 * Invalid or missing dates never produce a broken display.
 */
export function formatDashboardDate(value) {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
