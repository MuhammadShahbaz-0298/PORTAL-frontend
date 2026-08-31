/* Grading page: records stay visible in a table; grade changes require an explicit row action. */
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
import { Edit3, SlidersHorizontal } from "lucide-react";
import { gradeSubmission, listSubmissions } from "../../api/submissions";
import useApiResource from "../../hooks/useApiResource";
import { apiError } from "../../api/client";
import { PageHeader, StatusBadge } from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import ToastNotification from "../../components/ui/ToastNotification";

const displayName = (value, fallback) =>
  value?.name || value?.title || value || fallback;

export default function GradingPage() {
  const resource = useApiResource(listSubmissions);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ grade: "", feedback: "" });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const rows = useMemo(
    () =>
      resource.data.filter(item => {
        if (filter === "graded") return item.status === "graded";
        if (filter === "needs-review") return item.status !== "graded";
        return true;
      }),
    [resource.data, filter]
  );

  const openEditor = submission => {
    setSelected(submission);
    setForm({
      grade: submission.grade ?? "",
      feedback: submission.feedback ?? "",
    });
    setError("");
    setOpen(true);
  };

  const closeEditor = () => {
    setOpen(false);
    setSelected(null);
    setError("");
  };

  const save = async event => {
    event.preventDefault();
    if (!selected) return;
    if (form.grade === "") {
      setError("Enter marks before saving the grade.");
      return;
    }
    setError("");
    setNotice("");
    try {
      await gradeSubmission(selected._id, {
        grade: form.grade,
        feedback: form.feedback,
        status: "graded",
      });
      closeEditor();
      setNotice(
        selected.status === "graded"
          ? "Grade and feedback updated."
          : "Submission graded successfully."
      );
      await resource.reload();
    } catch (requestError) {
      setError(apiError(requestError));
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Assessment desk"
        title="Grading"
        description="Review every submission in one table and edit marks only when needed."
      />
      <ToastNotification
        message={resource.error || notice}
        variant={resource.error ? "error" : "success"}
        onClose={() => {
          if (resource.error) resource.reload();
          setNotice("");
        }}
      />
      <Card className="table-card">
        <CardBody>
          <div className="table-toolbar">
            <div>
              <div className="eyebrow">Submission records</div>
              <p className="muted">
                {rows.length} record{rows.length === 1 ? "" : "s"} shown
              </p>
            </div>
            <div className="record-filters" aria-label="Filter grading records">
              <SlidersHorizontal size={15} />
              {["all", "needs-review", "graded"].map(value => (
                <Button
                  key={value}
                  color={filter === value ? "dark" : "light"}
                  className={filter === value ? "active-filter" : ""}
                  onClick={() => setFilter(value)}
                >
                  {value === "all"
                    ? "All records"
                    : value === "needs-review"
                      ? "Needs review"
                      : "Graded"}
                </Button>
              ))}
            </div>
          </div>
          <DataTable
            columns={[
              "Learner",
              "Assignment",
              "Status",
              "Marks",
              "Feedback",
              "Submitted",
              "Action",
            ]}
            rows={rows}
            loading={resource.loading}
            error={resource.error}
            onRetry={resource.reload}
            empty={{
              title:
                filter === "graded"
                  ? "No graded records"
                  : filter === "needs-review"
                    ? "No submissions need review"
                    : "No submissions yet",
              text: "Submission records will appear here when learners upload their work.",
            }}
            renderRow={item => (
              <tr key={item._id}>
                <td>
                  <strong>{displayName(item.student, "Learner")}</strong>
                  <span className="row-sub">
                    {item.student?.email || "Student record"}
                  </span>
                </td>
                <td>{displayName(item.assignment, "Assignment")}</td>
                <td>
                  <StatusBadge
                    tone={item.status === "graded" ? "olive" : "coral"}
                  >
                    {item.status || "submitted"}
                  </StatusBadge>
                </td>
                <td>{item.grade ?? "—"}</td>
                <td className="feedback-cell">{item.feedback || "—"}</td>
                <td>
                  {item.submittedAt
                    ? new Date(item.submittedAt).toLocaleDateString()
                    : "—"}
                </td>
                <td>
                  <Button
                    color="light"
                    className="table-action"
                    onClick={() => openEditor(item)}
                  >
                    <Edit3 size={14} />{" "}
                    {item.status === "graded" ? "Edit" : "Grade"}
                  </Button>
                </td>
              </tr>
            )}
          />
        </CardBody>
      </Card>
      <Modal isOpen={open} toggle={closeEditor} fade={false} centered size="lg">
        <ModalHeader toggle={closeEditor}>
          {selected?.status === "graded"
            ? "Edit grade and feedback"
            : "Grade submission"}
        </ModalHeader>
        <ModalBody>
          <div className="grading-context">
            <span className="eyebrow">Selected submission</span>
            <strong>{displayName(selected?.student, "Learner")}</strong>
            <span>{displayName(selected?.assignment, "Assignment")}</span>
          </div>
          <Form onSubmit={save}>
            <FormGroup>
              <Label>Marks</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.grade}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    grade: event.target.value,
                  }))
                }
              />
            </FormGroup>
            <FormGroup>
              <Label>Feedback</Label>
              <Input
                type="textarea"
                rows="6"
                value={form.feedback}
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    feedback: event.target.value,
                  }))
                }
                placeholder="Add useful feedback for the learner"
              />
            </FormGroup>
            <ToastNotification
              message={error}
              variant="error"
              onClose={() => setError("")}
            />
            <div className="modal-actions">
              <Button type="button" color="light" onClick={closeEditor}>
                Cancel
              </Button>
              <Button type="submit" className="btn-coral">
                {selected?.status === "graded" ? "Save changes" : "Save grade"}
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
}
