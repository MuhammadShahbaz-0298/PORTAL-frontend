import { useCallback, useState } from "react";
import { Button } from "reactstrap";
import { Inbox, Plus } from "lucide-react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  listBatches,
  createBatch,
  updateBatch,
  deleteBatch,
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
import { hasPermission } from "../../lib/permissions";
import ToastNotification from "../../components/ui/ToastNotification";

export default function BatchesPage() {
  const user = useSelector(state => state.auth.user);
  const [createOpen, setCreateOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [editingBatch, setEditingBatch] = useState(null);
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

  const submitUpdate = async form => {
    if (!editingBatch?._id) return false;
    setError("");
    try {
      await updateBatch(editingBatch._id, form);
      setCreateOpen(false);
      setEditingBatch(null);
      setNotice("Batch updated successfully.");
      await batches.reload();
      return true;
    } catch (requestError) {
      setError(apiError(requestError));
      return false;
    }
  };

  const deleteSelectedBatch = async batch => {
    const confirmation = await Swal.fire({
      title: "Archive batch?",
      text: `${batch.name} will be archived. Existing enrollments and history are kept.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Archive batch",
      cancelButtonText: "Keep it",
      confirmButtonColor: "#b8563d",
      cancelButtonColor: "#173044",
      reverseButtons: true,
      customClass: {
        popup: "swal-linen",
        confirmButton: "swal-confirm",
        cancelButton: "swal-cancel",
      },
    });
    if (!confirmation.isConfirmed) return;

    setError("");
    try {
      await deleteBatch(batch._id);
      setNotice("Batch archived successfully.");
      await batches.reload();
    } catch (requestError) {
      setError(apiError(requestError));
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

  const canCreate = hasPermission(user, "batches.create");
  const canEdit = hasPermission(user, "batches.update");
  const canDelete = hasPermission(user, "batches.delete");
  const canEnroll = hasPermission(user, "batches.enroll");

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
      <ToastNotification
        message={batches.error || notice}
        variant={batches.error ? "error" : "success"}
        onClose={() => {
          if (batches.error) batches.reload();
          setNotice("");
        }}
      />
      {batches.loading ? (
        <LoadingState />
      ) : (batches.data || []).length === 0 ? (
        <div className="empty-state empty-state-inline">
          <Inbox size={28} />
          <strong>No batches yet</strong>
          <span>Create your first batch to start assigning students.</span>
        </div>
      ) : (
        <div className="batch-grid">
          {(batches.data || []).map(batch => (
            <BatchCard
              key={batch._id}
              batch={batch}
              canEdit={canEdit}
              canDelete={canDelete}
              canEnroll={canEnroll}
              onEnroll={openEnroll}
              onEdit={batch => {
                setEditingBatch(batch);
                setError("");
                setCreateOpen(true);
              }}
              onDelete={deleteSelectedBatch}
            />
          ))}
        </div>
      )}
      <BatchCreateModal
        isOpen={createOpen}
        teachers={teachers}
        error={error}
        onClose={() => {
          setCreateOpen(false);
          setEditingBatch(null);
          setError("");
        }}
        onSubmit={editingBatch ? submitUpdate : submitCreate}
        mode={editingBatch ? "edit" : "create"}
        initialValues={
          editingBatch
            ? { name: editingBatch.name, teacherId: editingBatch.teacher?._id || editingBatch.teacher || "" }
            : undefined
        }
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
