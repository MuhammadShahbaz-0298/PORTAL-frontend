/* Attendance feature: batch checklist marking with student history for learners. */
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import { CheckSquare, Plus, Search } from "lucide-react";
import { useSelector } from "react-redux";
import { listAttendance, markAttendance } from "../../api/attendance";
import { apiError } from "../../api/client";
import { listBatches, listBatchStudents } from "../../api/batches";
import useApiResource from "../../hooks/useApiResource";
import { PageHeader, StatusBadge } from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import SearchableSelect from "../../components/ui/SearchableSelect";
import ToastNotification from "../../components/ui/ToastNotification";
export default function AttendancePage() {
  const user = useSelector(state => state.auth.user);
  const studentId = user?.id || user?._id || user?.userId;
  const attendanceParams =
    user?.role === "student" && studentId ? { studentId } : undefined;
  const resource = useApiResource(listAttendance, {
    enabled: Boolean(user),
    key: `${user?.role || "guest"}:${studentId || "all"}`,
    params: attendanceParams,
  });
  const batches = useApiResource(listBatches, {
    enabled: Boolean(user),
    key: `${user?.role || "guest"}:batches`,
  });
  const [roster, setRoster] = useState([]);
  const [presentIds, setPresentIds] = useState([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    batchId: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return resource.data || [];
    return (resource.data || []).filter(record => {
      const studentName =
        typeof record.student === "object"
          ? record.student?.name
          : record.student;
      const studentEmail =
        typeof record.student === "object" ? record.student?.email : "";
      return [studentName, studentEmail].some(value =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedQuery)
      );
    });
  }, [resource.data, query]);

  const loadChecklist = async (batchId, date) => {
    if (!batchId) return;
    try {
      const [{ data: students }, { data: records }] = await Promise.all([
        listBatchStudents(batchId),
        listAttendance({ batchId, date }),
      ]);
      const nextRoster = Array.isArray(students)
        ? students
        : students?.students || [];
      const existing = Array.isArray(records)
        ? records
        : records?.records || [];
      setRoster(nextRoster);
      setPresentIds(
        existing
          .filter(record => record.status === "present")
          .map(record => record.student?._id || record.student)
      );
    } catch (requestError) {
      setError(apiError(requestError));
    }
  };
  const selectBatch = async batchId => {
    setForm(current => ({ ...current, batchId }));
    setRoster([]);
    setPresentIds([]);
    setError("");
    if (batchId) await loadChecklist(batchId, form.date);
  };
  const selectDate = async date => {
    setForm(current => ({ ...current, date }));
    setPresentIds([]);
    setError("");
    if (form.batchId) await loadChecklist(form.batchId, date);
  };
  const togglePresent = selectedStudentId =>
    setPresentIds(current =>
      current.includes(selectedStudentId)
        ? current.filter(id => id !== selectedStudentId)
        : [...current, selectedStudentId]
    );
  const submit = async event => {
    event.preventDefault();
    setError("");
    if (!form.batchId || !roster.length)
      return setError("Select a batch with students first.");
    try {
      await Promise.all(
        roster.map(student =>
          markAttendance({
            studentId: student._id,
            batchId: form.batchId,
            date: form.date,
            status: presentIds.includes(student._id) ? "present" : "absent",
          })
        )
      );
      setOpen(false);
      setError("");
      setNotice(`Attendance saved for ${roster.length} students.`);
      try {
        await resource.reload();
      } catch (reloadError) {
        setError(
          `Attendance was saved, but the history could not refresh. ${apiError(reloadError)}`
        );
      }
    } catch (requestError) {
      setError(apiError(requestError));
    }
  };
  const canMark = user?.role === "admin" || user?.role === "teacher";

  return (
    <>
      <PageHeader
        eyebrow="Daily register"
        title="Attendance"
        description={
          user?.role === "student"
            ? "Review the days you were present and absent."
            : "Select a batch, then mark present students in one pass."
        }
        action={
          canMark ? (
            <Button
              className="btn-coral"
              onClick={() => {
                setError("");
                setOpen(true);
              }}
            >
              <Plus size={15} /> Mark batch attendance
            </Button>
          ) : null
        }
      />
      <ToastNotification
        message={error || notice}
        variant={error ? "error" : "success"}
        onClose={() => {
          setError("");
          setNotice("");
        }}
      />
      <Card className="table-card">
        <CardBody>
          <div className="toolbar">
            <div className="searchbox">
              <Search size={16} />
              <Input
                placeholder="Search by student name or email"
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
            </div>
          </div>
          <DataTable
            columns={["Student", "Email", "Batch", "Date", "Status"]}
            rows={filteredRecords}
            loading={resource.loading}
            error={resource.error}
            onRetry={resource.reload}
            empty={{
              title: "No attendance history",
              text: query
                ? "No attendance records match your search."
                : user?.role === "student"
                  ? "Your attendance entries will appear here."
                  : "Choose a batch to record today’s register.",
            }}
            renderRow={item => (
              <tr key={item._id}>
                <td>{item.student?.name || item.student || "Student"}</td>
                <td>{item.student?.email || "—"}</td>
                <td>
                  {item.batch?.name || item.batchName || "Deleted batch"}
                </td>
                <td>
                  {item.date ? new Date(item.date).toLocaleDateString() : "—"}
                </td>
                <td>
                  <StatusBadge
                    tone={item.status === "present" ? "olive" : "coral"}
                  >
                    {item.status || "absent"}
                  </StatusBadge>
                </td>
              </tr>
            )}
          />
        </CardBody>
      </Card>
      <Modal
        isOpen={open}
        toggle={() => setOpen(false)}
        fade={false}
        centered
        size="lg"
      >
        <ModalHeader toggle={() => setOpen(false)}>
          Mark batch attendance
        </ModalHeader>
        <ModalBody>
          <Form onSubmit={submit}>
            <SearchableSelect
              label="Batch"
              placeholder="Search batches"
              required
              value={form.batchId}
              options={batches.data || []}
              getValue={batch => batch._id}
              getLabel={batch => batch.name}
              onChange={selectBatch}
            />
            <FormGroup>
              <Label>Date</Label>
              <Input
                type="date"
                required
                value={form.date}
                onChange={event => selectDate(event.target.value)}
              />
            </FormGroup>
            <div className="attendance-checklist">
              <div className="checklist-heading">
                <span>Students in selected batch</span>
                <small>Checked = present · unchecked = absent</small>
              </div>
              {roster.map(student => (
                <label className="attendance-check" key={student._id}>
                  <input
                    type="checkbox"
                    checked={presentIds.includes(student._id)}
                    onChange={() => togglePresent(student._id)}
                  />
                  <span>{student.name}</span>
                  <small>{student.email}</small>
                </label>
              ))}
              {form.batchId && !roster.length && (
                <p className="muted">
                  No students are enrolled in this batch yet.
                </p>
              )}
            </div>
            <ToastNotification
              message={error}
              variant="error"
              onClose={() => setError("")}
            />
            <Button
              type="submit"
              className="btn-coral w-100"
              disabled={!roster.length}
            >
              <CheckSquare size={15} /> Save attendance
            </Button>
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
}
