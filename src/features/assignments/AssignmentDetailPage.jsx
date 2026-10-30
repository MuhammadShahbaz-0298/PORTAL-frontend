/* Assignment detail feature: lifecycle-aware brief view with one submission and edit-only replacement. */
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { Link, useParams } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import { Edit3, Upload } from "lucide-react";
import { getAssignment } from "../../api/assignments";
import {
  listSubmissions,
  saveSubmissionFile,
} from "../../api/submissions";
import { apiError } from "../../api/client";
import {
  PageHeader,
  LoadingState,
  ErrorState,
} from "../../components/ui/PageHeader";
import ToastNotification from "../../components/ui/ToastNotification";

const isExpired = assignment =>
  Boolean(assignment?.dueDate && new Date(assignment.dueDate) <= new Date());
const getSubmission = payload =>
  Array.isArray(payload)
    ? payload[0]
    : payload?.items?.[0] || payload?.records?.[0] || null;

export default function AssignmentDetailPage() {
  const { assignmentId } = useParams({
    from: "/protected/assignments/$assignmentId",
  });
  const user = useSelector(state => state.auth.user);
  const student = user?.role === "student";
  const [assignment, setAssignment] = useState(null);
  const [existing, setExisting] = useState(null);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const assignmentResponse = await getAssignment(assignmentId);
        const submissionResponse = student
          ? await listSubmissions({ assignmentId })
          : null;
        if (!cancelled) {
          setAssignment(assignmentResponse.data);
          setExisting(getSubmission(submissionResponse?.data));
        }
      } catch (requestError) {
        if (!cancelled) setError(apiError(requestError));
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [assignmentId, student]);

  const openForSubmission = Boolean(
    assignment?.active !== false && !isExpired(assignment)
  );
  const saveSubmission = async event => {
    event.preventDefault();
    if (!file || !openForSubmission || saving) return;
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const response = await saveSubmissionFile({
        assignmentId,
        submissionId: existing?._id,
        file,
      });
      setExisting(response.data);
      setFile(null);
      setNotice(
        existing
          ? "Submission updated. Your previous file was replaced."
          : "Submission uploaded. You can use Edit submission to replace it before the deadline."
      );
    } catch (requestError) {
      setError(apiError(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (error) return <ErrorState message={error} />;
  if (!assignment) return <LoadingState text="Reading the assignment brief…" />;
  const status =
    assignment.active === false
      ? "Closed"
      : isExpired(assignment)
        ? "Expired"
        : "Open";
  return (
    <>
      <Link className="back-link" to="/assignments">
        ← Back to assignments
      </Link>
      <PageHeader
        eyebrow="Assignment brief"
        title={assignment.title}
        description={`Due ${assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : "not set"}`}
      />
      <div className="detail-grid">
        <Card className="brief-card">
          <CardBody>
            <div className="eyebrow">The brief</div>
            <h2>{assignment.title}</h2>
            <p className="lead">
              {assignment.description || "No description has been provided."}
            </p>
            <div className="brief-meta">
              <div>
                <span>Batch</span>
                <strong>{assignment.batch?.name || "Assigned batch"}</strong>
              </div>
              <div>
                <span>Deadline</span>
                <strong>
                  {assignment.dueDate
                    ? new Date(assignment.dueDate).toLocaleString()
                    : "Not set"}
                </strong>
              </div>
              <div>
                <span>Status</span>
                <strong
                  className={
                    status === "Open" ? "status-open" : "status-closed"
                  }
                >
                  {status}
                </strong>
              </div>
              <div>
                <span>Submission rule</span>
                <strong>One file · edit to replace</strong>
              </div>
            </div>
          </CardBody>
        </Card>
        {student ? (
          <Card className="form-card">
            <CardBody>
              <div className="eyebrow">Your submission</div>
              <h2>{existing ? "Edit submission" : "Upload archive"}</h2>
              {existing && (
                <p className="form-note">
                  You have already submitted{" "}
                  <strong>{existing.fileName || "a file"}</strong>. Uploading
                  here replaces that submission; it does not create another
                  attempt.
                </p>
              )}
              {!openForSubmission && (
                <ToastNotification
                  message={`This assignment is ${status.toLowerCase()}; new uploads and edits are closed.`}
                  onClose={() => setNotice("")}
                />
              )}
              <ToastNotification
                message={notice}
                variant="success"
                onClose={() => setNotice("")}
              />
              {openForSubmission && (
                <Form onSubmit={saveSubmission}>
                  <FormGroup>
                    <Label for="submission-file">
                      {existing ? "Replacement ZIP file" : "ZIP file"}
                    </Label>
                    <Input
                      id="submission-file"
                      type="file"
                      accept=".zip,application/zip"
                      required
                      disabled={saving}
                      onChange={event =>
                        setFile(event.target.files?.[0] || null)
                      }
                    />
                  </FormGroup>
                  <Button className="btn-coral" disabled={!file || saving}>
                    <>{existing ? <Edit3 size={15} /> : <Upload size={15} />}</>{" "}
                    {saving
                      ? "Saving…"
                      : existing
                        ? "Edit submission"
                        : "Upload submission"}
                  </Button>
                </Form>
              )}
            </CardBody>
          </Card>
        ) : (
          <Card className="form-card">
            <CardBody>
              <div className="eyebrow">Submission window</div>
              <h2>{status}</h2>
              <p>
                {status === "Open"
                  ? "Learners can submit until the deadline."
                  : "Learners can no longer upload to this assignment."}
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </>
  );
}
