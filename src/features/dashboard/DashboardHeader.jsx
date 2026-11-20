/* DashboardHeader: show the current greeting and a route to the workspace.
 * The date is supplied by the page so dashboard sections share one clock value.
 */
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import { buttonClassName } from "../../components/ui/Button";

export default function DashboardHeader({ date }) {
  const hour = date.getHours();
  const greeting =
    hour < 12
      ? "Good Morning."
      : hour < 18
        ? "Good Afternoon."
        : "Good Evening.";
  const dayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);

  return (
    <PageHeader
      eyebrow={`${dayName} · overview`}
      title={greeting}
      description="A clear view of the people, work, and signals that need attention today."
      action={
        <Link to="/assignments" className={buttonClassName()}>
          Open workspace
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      }
    />
  );
}
