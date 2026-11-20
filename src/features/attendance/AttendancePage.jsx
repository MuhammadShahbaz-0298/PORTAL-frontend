/* Attendance page: register history plus the staff checklist modal. */
import { useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { Plus } from "lucide-react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataList from "../../components/ui/DataList";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import Toast from "../../components/ui/Toast";
import { hasPermission } from "../../lib/permissions";
import AttendanceCard from "./AttendanceCard";
import MarkAttendanceModal from "./MarkAttendanceModal";
import {
  batchName,
  formatDate,
  studentEmail,
  studentName,
} from "./attendanceUtils";

function AttendancePage({
  attendance,
  user,
  studentId: filterStudentIdProp,
  readOnly = false,
  load,
  loadBatches,
  setQuery,
  openForm,
  exportExcel,
  clearMessages,
}) {
  const student = user?.role === "student";
  const ownStudentId = user?.id || user?._id || user?.userId;
  const filterStudentId = filterStudentIdProp || (student ? ownStudentId : undefined);
  const canMark = !readOnly && hasPermission(user, "attendance.manage", [
    "admin",
    "teacher",
  ]);
  const canExport = hasPermission(user, "attendance.export");

  // One mount effect: this learner's history, or the register for staff.
  useEffect(() => {
    load({ studentId: filterStudentId });
    if (canMark) loadBatches();
  }, [load, loadBatches, filterStudentId, canMark]);

  const rows = useMemo(() => {
    const needle = attendance.query.trim().toLowerCase();
    if (!needle) return attendance.items;

    return attendance.items.filter(item =>
      [
        studentName(item.student),
        studentEmail(item.student),
        batchName(item.batch || item.batchName),
        item.leaveReason,
      ]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(needle))
    );
  }, [attendance.items, attendance.query]);

  const message = attendance.pageError || attendance.notice;
  const countLabel = attendance.query
    ? `Showing ${rows.length} of ${attendance.total} records`
    : `Showing ${attendance.total} records`;

  const columns = [
    {
      key: "student",
      label: "Student",
      render: record => (
        <div className="min-w-0">
          <p className="font-semibold text-ink">
            {studentName(record.student)}
          </p>
          <p className="text-xs text-muted">
            {studentEmail(record.student) || "No email on record"}
          </p>
        </div>
      ),
    },
    {
      key: "batch",
      label: "Batch",
      render: record => batchName(record.batch || record.batchName),
    },
    {
      key: "date",
      label: "Date",
      render: record => formatDate(record.date),
    },
    {
      key: "status",
      label: "Status",
      render: record => {
        let tone = "danger";
        if (record.status === "present") tone = "success";
        else if (record.status === "leave") tone = "warning";

        return (
          <Badge tone={tone}>
            {record.status || "absent"}
          </Badge>
        );
      },
    },
    {
      key: "reason",
      label: "Reason",
      render: record => {
        if (record.status === "leave") {
          return record.leaveReason || "No reason recorded";
        }
        return "—";
      },
    },
  ];

  return (
    <div className="font-sans">
      {readOnly ? (
        <div className="mb-4">
          <h2 className="font-sans text-xl font-semibold tracking-tight text-ink">
            Attendance
          </h2>
          <p className="mt-1 text-sm text-muted">Attendance history.</p>
        </div>
      ) : (
        <PageHeader
          eyebrow="Daily register"
          title="Attendance"
          description={
            student
              ? "Review the days you were present, absent, or on leave with a reason."
              : "Select a batch, then mark present students in one pass."
          }
          action={
            <div className="flex gap-2">
              {canExport ? (
                <Button
                  variant="secondary"
                  onClick={exportExcel}
                  loading={attendance.exporting}
                >
                  Export Excel
                </Button>
              ) : null}
              {canMark ? (
                <Button onClick={openForm}>
                  <Plus size={16} aria-hidden="true" />
                  Mark attendance
                </Button>
              ) : null}
            </div>
          }
        />
      )}

      <Toast
        message={message}
        tone={attendance.pageError ? "error" : "success"}
        onClose={clearMessages}
      />

      {attendance.exportError ? (
        <p role="alert" className="mb-4 rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          {attendance.exportError}
        </p>
      ) : null}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={attendance.query}
          onChange={setQuery}
          placeholder="Search by student name, email, or batch"
          className="sm:max-w-sm"
        />
        <p className="text-sm text-muted">{countLabel}</p>
      </div>

      <DataList
        columns={columns}
        rows={rows}
        rowKey={record => record._id || record.id}
        renderCard={record => <AttendanceCard record={record} />}
        loading={attendance.loading}
        error={attendance.error}
        onRetry={() => load({ studentId: filterStudentId })}
        emptyTitle={
          attendance.query ? "No matching records" : "No attendance history"
        }
        emptyText={
          attendance.query
            ? "Try a different student name, email, or batch."
            : student
              ? "Your attendance entries will appear here."
              : readOnly
                ? "Attendance records will appear here."
                : "Mark a batch register to start the history."
        }
      />

      {canMark ? (
        <MarkAttendanceModal studentId={student ? ownStudentId : undefined} />
      ) : null}
    </div>
  );
}

const mapState = state => ({
  attendance: state.attendance,
  user: state.auth.user,
});

const mapDispatch = dispatch => ({
  load: dispatch.attendance.load,
  loadBatches: dispatch.attendance.loadBatches,
  exportExcel: dispatch.attendance.exportExcel,
  setQuery: dispatch.attendance.setQuery,
  openForm: dispatch.attendance.openForm,
  clearMessages: dispatch.attendance.clearMessages,
});

export default connect(mapState, mapDispatch)(AttendancePage);
