/* Calendar view: month grid by default, with an agenda list as the fallback view. */
import { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { CalendarDays, ChevronLeft, ChevronRight, Download, List, Plus } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import { DAYS_OF_WEEK } from "../../constants/app";
import { hasPermission } from "../../lib/permissions";
import EventFormModal from "../events/EventFormModal";

const WEEKS_IN_GRID = 6;
const EVENT_TONES = {
  Assignment: "brand",
  Announcement: "success",
  Event: "warning",
};

const startOfMonth = date => new Date(date.getFullYear(), date.getMonth(), 1);
const addMonths = (date, amount) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);
const dateKey = date =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

function CalendarPage({
  user,
  assignments,
  announcements,
  events,
  calendar,
  loadAssignments,
  loadAnnouncements,
  loadEvents,
  downloadCalendar,
  openEventForm,
}) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [view, setView] = useState("month");
  const canManageEvents = hasPermission(user, "events.manage", ["admin", "teacher"]);
  const canViewCalendar = hasPermission(user, "calendar.view", [
    "admin",
    "teacher",
    "student",
  ]);

  useEffect(() => {
    loadAssignments();
    loadAnnouncements();
    loadEvents();
  }, [loadAssignments, loadAnnouncements, loadEvents]);

  const items = useMemo(() => {
    const list = [];
    (assignments.items || []).forEach(a => {
      if (a.dueDate) list.push({ type: "Assignment", title: a.title, date: a.dueDate });
    });
    (announcements.items || []).forEach(a => {
      list.push({ type: "Announcement", title: a.title, date: a.createdAt || a.updatedAt });
    });
    (events.items || []).forEach(event => {
      list.push({ type: "Event", title: event.title, date: event.date });
    });
    return list.sort((x, y) => new Date(x.date) - new Date(y.date));
  }, [assignments.items, announcements.items, events.items]);

  const eventsByDate = useMemo(() => {
    const grouped = new Map();
    items.forEach(item => {
      const date = new Date(item.date);
      if (Number.isNaN(date.getTime())) return;
      const key = dateKey(date);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(item);
    });
    return grouped;
  }, [items]);

  const agenda = useMemo(
    () => [...eventsByDate.entries()].sort(([left], [right]) => left.localeCompare(right)),
    [eventsByDate]
  );

  const days = useMemo(() => {
    const first = startOfMonth(cursor);
    const mondayOffset = (first.getDay() + 6) % 7;
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - mondayOffset);

    return Array.from({ length: WEEKS_IN_GRID * DAYS_OF_WEEK.length }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [cursor]);

  const todayKey = dateKey(new Date());

  return (
    <div className="font-sans">
      <PageHeader
        eyebrow="Schedule"
        title="Calendar"
        description="Assignment due dates, announcements, and events."
        action={
          <div className="flex flex-wrap gap-2">
            {canViewCalendar ? (
              <Button
                variant="secondary"
                onClick={downloadCalendar}
                loading={calendar.downloading}
              >
                <Download size={16} aria-hidden="true" />
                Download .ics
              </Button>
            ) : null}
            {canManageEvents ? (
              <Button onClick={() => openEventForm(null)}>
                <Plus size={16} aria-hidden="true" />
                Add event
              </Button>
            ) : null}
            <Button
              variant={view === "month" ? "primary" : "secondary"}
              onClick={() => setView("month")}
            >
              <CalendarDays size={16} aria-hidden="true" /> Month
            </Button>
            <Button
              variant={view === "agenda" ? "primary" : "secondary"}
              onClick={() => setView("agenda")}
            >
              <List size={16} aria-hidden="true" /> Agenda
            </Button>
          </div>
        }
      />

      {calendar.error ? (
        <p role="alert" className="mb-4 rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          Could not download the calendar: {calendar.error}
        </p>
      ) : null}
      {canViewCalendar ? (
        <p className="mb-4 text-xs text-muted">
          An .ics file is an iCalendar download you can import into Google,
          Outlook, or Apple Calendar. It is not a live subscription; download it
          again to get updates.
        </p>
      ) : null}

      {view === "month" ? (
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
            <h2 className="font-sans text-lg font-semibold text-ink">
              {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                aria-label="Previous month"
                onClick={() => setCursor(current => addMonths(current, -1))}
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </Button>
              <Button variant="secondary" onClick={() => setCursor(startOfMonth(new Date()))}>
                Today
              </Button>
              <Button
                variant="secondary"
                aria-label="Next month"
                onClick={() => setCursor(current => addMonths(current, 1))}
              >
                <ChevronRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-line bg-canvas">
            {DAYS_OF_WEEK.map(day => (
              <div
                key={day}
                className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted"
              >
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map(date => {
              const key = dateKey(date);
              const dayEvents = eventsByDate.get(key) || [];
              const inMonth =
                date.getMonth() === cursor.getMonth() &&
                date.getFullYear() === cursor.getFullYear();
              const isToday = key === todayKey;

              return (
                <div
                  key={key}
                  className={`min-h-24 border-b border-l border-line p-2 ${
                    inMonth ? "bg-surface" : "bg-canvas/60"
                  } ${isToday ? "ring-1 ring-inset ring-brand" : ""}`}
                >
                  <p
                    className={`text-xs font-semibold ${
                      isToday ? "text-brand" : inMonth ? "text-ink" : "text-muted"
                    }`}
                  >
                    {date.getDate()}
                  </p>
                  <div className="mt-1 grid gap-1">
                    {dayEvents.map((event, index) => (
                      <Badge
                        key={`${event.type}-${event.title}-${index}`}
                        tone={EVENT_TONES[event.type] || "neutral"}
                        className="justify-start truncate"
                      >
                        {event.title}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {!items.length ? (
            <p className="border-t border-line p-4 text-sm text-muted">
              Nothing scheduled yet.
            </p>
          ) : null}
        </Card>
      ) : (
        <Card className="p-5">
          {agenda.length ? (
            <ul className="divide-y divide-line">
              {agenda.map(([key, dayEvents]) => (
                <li key={key} className="py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
                    {new Date(`${key}T00:00:00`).toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <ul className="mt-2 grid gap-2">
                    {dayEvents.map((event, index) => (
                      <li
                        key={`${event.type}-${event.title}-${index}`}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-sm font-medium text-ink">
                          {event.title}
                        </span>
                        <Badge tone={EVENT_TONES[event.type] || "neutral"}>
                          {event.type}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-muted">
              Nothing scheduled yet.
            </p>
          )}
        </Card>
      )}
      {canManageEvents ? <EventFormModal /> : null}
    </div>
  );
}

const mapState = state => ({
  user: state.auth.user,
  assignments: state.assignments,
  announcements: state.announcements,
  events: state.events,
  calendar: state.calendar,
});
const mapDispatch = dispatch => ({
  loadAssignments: dispatch.assignments.load,
  loadAnnouncements: dispatch.announcements.load,
  loadEvents: dispatch.events.load,
  downloadCalendar: dispatch.calendar.download,
  openEventForm: dispatch.events.openForm,
});
export default connect(mapState, mapDispatch)(CalendarPage);
