/* Submissions feature: student upload plus teacher/admin review and student grade visibility. */
import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { Download, Upload } from "lucide-react";
import { useSelector } from "react-redux";
import {
  listSubmissions,
  saveSubmissionFile,
  downloadSubmission,
} from "../../api/submissions";
import { listAssignments } from "../../api/assignments";
import useApiResource from "../../hooks/useApiResource";
import { PageHeader, StatusBadge } from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import ToastNotification from "../../components/ui/ToastNotification";
import SearchableSelect from "../../components/ui/SearchableSelect";
import ProgressBar from "../../components/ui/ProgressBar";
import { getProgressPercentage } from "../../lib/transferProgress";
export default function SubmissionsPage() {
  const user = useSelector(state => state.auth.user);
  const resource = useApiResource(listSubmissions);
  const assignments = useApiResource(listAssignments, {
    enabled: user?.role === "student",
  });
  const [assignmentId, setAssignmentId] = useState("");
  const [file, setFile] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const selectedSubmission = (resource.data || []).find(
    submission =>
      String(submission.assignment?._id || submission.assignment) ===
      assignmentId
  );
  let submitLabel = selectedSubmission
    ? "Edit submission"
    : "Upload submission";
  if (uploading) {
    submitLabel = selectedSubmission ? "Updating..." : "Uploading...";
  }
  const submit = async event => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!assignmentId || !file)
      return setError("Choose an assignment and ZIP file.");
    setUploading(true);
    setUploadProgress(0);
    try {
      await saveSubmissionFile({
        assignmentId,
        submissionId: selectedSubmission?._id,
        file,
        onUploadProgress: event =>
          setUploadProgress(getProgressPercentage(event)),
      });
      setNotice(
        selectedSubmission
          ? "Submission updated successfully."
          : "Submission uploaded successfully."
      );
      setFile(null);
      await resource.reload();
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          `Unable to ${selectedSubmission ? "update" : "upload"} submission.`
      );
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };
  const download = async (id, name) => {
    setError("");
    setDownloadingId(id);
    setDownloadProgress(0);
    try {
      const response = await downloadSubmission(id, progressEvent => {
        setDownloadProgress(getProgressPercentage(progressEvent));
      });
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = name || "submission.zip";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Unable to download submission.");
    } finally {
      setDownloadingId(null);
      setDownloadProgress(null);
    }
  };
  const student = user?.role === "student";
  return (
    <>
      <PageHeader
        eyebrow={student ? "Your work" : "Submission inbox"}
        title="Submissions"
        description={
          student
            ? "Track status, grades, and feedback on your work."
            : "Review learner work and open the grading desk."
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
          <DataTable
            columns={[
              "Learner",
              "Assignment",
              "Status",
              "Grade",
              "Feedback",
              "File",
            ]}
            rows={resource.data || []}
            loading={resource.loading}
            error={resource.error}
            onRetry={resource.reload}
            renderRow={item => (
              <tr key={item._id}>
                <td>{item.student?.name || item.student || "Learner"}</td>
                <td>
                  {item.assignment?.title || item.assignment || "Assignment"}
                </td>
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
                  {downloadingId !== item._id && (
                    <Button
                      color="link"
                      className="icon-button"
                      onClick={() => download(item._id, item.fileName)}
                      disabled={downloadingId !== null}
                      aria-label="Download submission"
                    >
                      <Download size={16} />
                    </Button>
                  )}
                  {downloadingId === item._id && (
                    <ProgressBar
                      value={downloadProgress}
                      label="Downloading..."
                      valueLabel=""
                    />
                  )}
                </td>
              </tr>
            )}
          />
        </CardBody>
      </Card>
      {student && (
        <Card className="form-card">
          <CardBody>
            <div className="eyebrow">Submit work</div>
            <h2>
              {selectedSubmission
                ? "Edit your submission"
                : "Upload a ZIP archive"}
            </h2>
            <Form onSubmit={submit}>
              <SearchableSelect
                label="Assignment"
                placeholder="Search assignments"
                required
                value={assignmentId}
                options={assignments.data || []}
                getValue={assignment => assignment._id}
                getLabel={assignment => assignment.title}
                onChange={setAssignmentId}
              />
              <FormGroup>
                <Label>
                  {selectedSubmission ? "Replacement ZIP file" : "ZIP file"}
                </Label>
                <Input
                  required
                  type="file"
                  accept=".zip,application/zip"
                  disabled={uploading}
                  onChange={event => setFile(event.target.files?.[0])}
                />
              </FormGroup>
              <Button
                type="submit"
                className="btn-coral"
                disabled={uploading}
              >
                <Upload size={15} />{" "}
                {submitLabel}
              </Button>
              {uploading && (
                <ProgressBar
                  value={uploadProgress}
                  label="Uploading..."
                  valueLabel=""
                  completedLabel="Processing submission..."
                />
              )}
            </Form>
          </CardBody>
        </Card>
      )}
    </>
  );
}
