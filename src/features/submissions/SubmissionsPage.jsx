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
  uploadSubmission,
  downloadSubmission,
} from "../../api/submissions";
import { listAssignments } from "../../api/assignments";
import useApiResource from "../../hooks/useApiResource";
import { PageHeader, StatusBadge } from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import ToastNotification from "../../components/ui/ToastNotification";
import SearchableSelect from "../../components/ui/SearchableSelect";
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
  const submit = async event => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!assignmentId || !file)
      return setError("Choose an assignment and ZIP file.");
    setUploading(true);
    setUploadProgress(0);
    try {
      await uploadSubmission(assignmentId, file, progressEvent => {
        setUploadProgress(
          progressEvent.total
            ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
            : null
        );
      });
      setNotice("Submission uploaded successfully.");
      setFile(null);
      await resource.reload();
    } catch (requestError) {
      setError(
        requestError.response?.data?.error || "Unable to upload submission."
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
        setDownloadProgress(
          progressEvent.total
            ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
            : null
        );
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
              "Attempt",
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
                <td>#{item.attempt || 1}</td>
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
                  <Button
                    color="link"
                    className="icon-button"
                    onClick={() => download(item._id, item.fileName)}
                    disabled={downloadingId !== null}
                    aria-label="Download submission"
                  >
                    <Download size={16} />
                  </Button>
                  {downloadingId === item._id && (
                    <div>
                      <progress
                        max="100"
                        value={downloadProgress ?? undefined}
                        aria-label="Download progress"
                      />
                      <small>
                        {downloadProgress == null
                          ? "Downloading..."
                          : `${downloadProgress}%`}
                      </small>
                    </div>
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
            <h2>Upload a ZIP archive</h2>
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
                <Label>ZIP file</Label>
                <Input
                  required
                  type="file"
                  accept=".zip,application/zip"
                  onChange={event => setFile(event.target.files?.[0])}
                />
              </FormGroup>
              <Button
                type="submit"
                className="btn-coral"
                disabled={uploading}
              >
                <Upload size={15} />{" "}
                {uploading ? "Uploading..." : "Upload submission"}
              </Button>
              {uploading && (
                <div>
                  <progress
                    max="100"
                    value={uploadProgress ?? undefined}
                    aria-label="Upload progress"
                  />
                  <small>
                    {uploadProgress == null
                      ? "Uploading..."
                      : uploadProgress === 100
                        ? "Processing submission..."
                        : `${uploadProgress}% uploaded`}
                  </small>
                </div>
              )}
            </Form>
          </CardBody>
        </Card>
      )}
    </>
  );
}
