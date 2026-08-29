import { useCallback, useState } from "react";
import { Alert, Button } from "reactstrap";
import { Plus } from "lucide-react";
import { useSelector } from "react-redux";
import {
  listBatches,
  createBatch,
  enrollStudent,
  listBatchStudents,
} from "../../api/batches";
import { listUsers } from "../../api/users";
import { apiError } from "../../api/client";
import useApiResource from "../../hooks/useApiResource";
import { LoadingState, PageHeader } from "../../components/ui/PageHeader";
import BatchCard from "./BatchCard";
import BatchCreateModal from "./BatchCreateModal";
import BatchEnrollmentModal from "./BatchEnrollmentModal";
import { normalizePeople } from "./batchUtils";

export default function BatchesPage() {
  const user = useSelector(state => state.auth.user);
  const [createOpen, setCreateOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [enrolled, setEnrolled] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const listTeachers = useCallback(
    params => listUsers({ ...(params || {}), role: "teacher" }),
    []
  );
  const listStudents = useCallback(
    params => listUsers({ ...(params || {}), role: "student" }),
    []
  );
  const batches = useApiResource(listBatches);
  const teachers = useApiResource(listTeachers, {
    enabled: user?.role === "admin",
  });
  const students = useApiResource(listStudents, {
    enabled: ["admin", "teacher"].includes(user?.role),
  });

  const openEnroll = async batch => {
    setSelectedBatch(batch);
    setStudentId("");
    setError("");
    setEnrollOpen(true);
    try {
      const response = await listBatchStudents(batch._id);
      setEnrolled(normalizePeople(response.data));
    } catch (requestError) {
      setError(apiError(requestError));
    }
  };

  const submitCreate = async form => {
    setError("");
    try {
      await createBatch(form);
      setCreateOpen(false);
      setNotice("Batch created successfully.");
      await batches.reload();
      return true;
    } catch (requestError) {
      setError(apiError(requestError));
      return false;
    }
  };

  const submitEnroll = async event => {
    event.preventDefault();
    setError("");
    if (!selectedBatch?._id || !studentId) {
      setError("Choose a student before enrolling.");
      return;
    }
    try {
      await enrollStudent(selectedBatch._id, studentId);
      const response = await listBatchStudents(selectedBatch._id);
      setEnrolled(normalizePeople(response.data));
      setStudentId("");
      setNotice("Student enrolled successfully.");
      await batches.reload();
    } catch (requestError) {
      setError(apiError(requestError));
    }
  };

  const canCreate = user?.role === "admin";
  const canManage = canCreate || user?.role === "teacher";

  return (
    <>
      <PageHeader
        eyebrow="Cohorts"
        title="Batches"
        description="Manage teaching groups, assigned teachers, and enrollment."
        action={
          canCreate && (
            <Button
              className="btn-coral"
              onClick={() => {
                setError("");
                setCreateOpen(true);
              }}
            >
              <Plus size={15} /> New batch
            </Button>
          )
        }
      />
      {batches.error && (
        <Alert color="danger" fade={false}>
          {batches.error}
          <Button
            color="link"
            className="retry-button"
            onClick={batches.reload}
          >
            Try again
          </Button>
        </Alert>
      )}
      {notice && (
        <Alert color="success" fade={false}>
          {notice}
        </Alert>
      )}
      {batches.loading ? (
        <LoadingState />
      ) : (
        <div className="batch-grid">
          {(batches.data || []).map(batch => (
            <BatchCard
              key={batch._id}
              batch={batch}
              canManage={canManage}
              onEnroll={openEnroll}
            />
          ))}
        </div>
      )}
      <BatchCreateModal
        isOpen={createOpen}
        teachers={teachers}
        error={error}
        onClose={() => setCreateOpen(false)}
        onSubmit={submitCreate}
      />
      <BatchEnrollmentModal
        isOpen={enrollOpen}
        batch={selectedBatch}
        students={students}
        enrolled={enrolled}
        studentId={studentId}
        error={error}
        onClose={() => setEnrollOpen(false)}
        onStudentChange={setStudentId}
        onSubmit={submitEnroll}
      />
    </>
  );
}
