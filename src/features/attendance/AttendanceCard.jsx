/* AttendanceCard: the phone row for one attendance record. */
import Badge from "../../components/ui/Badge";
import {
  batchName,
  formatDate,
  studentEmail,
  studentName,
} from "./attendanceUtils";

export default function AttendanceCard({ record }) {
  const present = record.status === "present";

  return (
    <div className="grid gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {studentName(record.student)}
          </p>
          <p className="truncate text-xs text-muted">
            {studentEmail(record.student) || "No email on record"}
          </p>
        </div>
        <Badge tone={present ? "success" : "danger"}>
          {record.status || "absent"}
        </Badge>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-control bg-canvas p-2.5">
          <dt className="text-xs text-muted">Batch</dt>
          <dd className="mt-0.5 truncate font-semibold text-ink">
            {batchName(record.batch || record.batchName)}
          </dd>
        </div>
        <div className="rounded-control bg-canvas p-2.5">
          <dt className="text-xs text-muted">Date</dt>
          <dd className="mt-0.5 font-semibold text-ink">
            {formatDate(record.date)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
