import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardBody } from "reactstrap";
import { Plus, Search } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useSelector } from "react-redux";
import {
  archiveAssignment,
  createAssignment,
  listAssignments,
  updateAssignment,
} from "../../api/assignments";
import { listBatches } from "../../api/batches";
import { apiError } from "../../api/client";
import { domainTypes, useResource } from "../../hooks/useResource";
import { PageHeader } from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import AssignmentCreateModal from "./AssignmentCreateModal";
import AssignmentDetailModal from "./AssignmentDetailModal";
import AssignmentRow from "./AssignmentRow";
import { hasPermission } from "../../lib/permissions";
import ToastNotification from "../../components/ui/ToastNotification";

const [request, success, failure] = domainTypes.assignments;
const EMPTY_FORM = { title: "", description: "", dueDate: "", batch: "" };

export default function AssignmentsPage() {
  const user = useSelector(state => state.auth.user);
  const canCreate = hasPermission(user, "assignments.create");
  const canEdit = hasPermission(user, "assignments.update");
  const canDelete = hasPermission(user, "assignments.delete");
  const resource = useResource(
    "assignments",
    request,
    success,
    failure,
    listAssignments
  );
  const [batchOptions, setBatchOptions] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [closingId, setClosingId] = useState(null);
  const [notice, setNotice] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    resource.load().catch(() => undefined);
    listBatches()
      .then(({ data }) =>
        setBatchOptions(Array.isArray(data) ? data : data?.items || [])
      )
      .catch(() => setBatchOptions([]));
  }, []);

  const rows = useMemo(
    () =>
      resource.items.filter(item =>
        (item.title || "").toLowerCase().includes(query.toLowerCase())
      ),
    [resource.items, query]
  );

  const updateForm = (field, value) =>
    setForm(current => ({ ...current, [field]: value }));

  const create = async event => {
    event.preventDefault();
    setSubmitError("");
    setNotice("");
    try {
      await createAssignment({
        ...form,
        allowedFileTypes: ["zip"],
        maxFileSizeMb: 50,
        resubmissionPolicy: "disabled",
        active: true,
      });
      setOpen(false);
      setForm(EMPTY_FORM);
      setNotice("Assignment created successfully.");
      await resource.load();
    } catch (error) {
      setSubmitError(apiError(error));
    }
  };

  const saveAssignment = async event => {
    event.preventDefault();
    if (!editingAssignment?._id) return;
    setSubmitError("");
    setNotice("");
    try {
      await updateAssignment(editingAssignment._id, {
        ...form,
        allowedFileTypes: ["zip"],
        maxFileSizeMb: 50,
        resubmissionPolicy: "disabled",
      });
      setOpen(false);
      setEditingAssignment(null);
      setForm(EMPTY_FORM);
      setNotice("Assignment updated successfully.");
      await resource.load();
    } catch (error) {
      setSubmitError(apiError(error));
    }
  };

  const closeAssignment = async id => {
    const confirmation = await Swal.fire({
      title: "Close assignment?",
      text: "Students will no longer be able to upload or edit submissions after this assignment is closed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Close assignment",
      cancelButtonText: "Keep open",
      confirmButtonColor: "#e46b4b",
      cancelButtonColor: "#173044",
      reverseButtons: true,
      customClass: {
        popup: "swal-linen",
        confirmButton: "swal-confirm",
        cancelButton: "swal-cancel",
      },
    });
    if (!confirmation.isConfirmed) return;

    setClosingId(id);
    setSubmitError("");
    try {
      await archiveAssignment(id);
      setNotice("Assignment closed. New submissions are no longer accepted.");
      await resource.load();
    } catch (error) {
      setSubmitError(apiError(error));
    } finally {
      setClosingId(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Teaching workspace"
        title="Assignments"
        description="Create briefs, keep deadlines visible, and see where learning is landing."
        action={
          canCreate && (
            <Button
              className="btn-coral"
              onClick={() => {
                setSubmitError("");
                setOpen(true);
              }}
            >
              <Plus size={16} /> New assignment
            </Button>
          )
        }
      />
      <ToastNotification message={notice} onClose={() => setNotice("")} />
      {submitError && (
        <Alert color="danger" fade={false}>
          {submitError}
        </Alert>
      )}
      <Card className="table-card">
        <CardBody>
          <div className="toolbar">
            <div className="searchbox">
              <Search size={16} />
              <input
                placeholder="Search assignments"
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
            </div>
          </div>
          <DataTable
            columns={
              canEdit || canDelete
                ? ["Assignment", "Batch", "Due date", "Status", "View", "Actions"]
                : ["Assignment", "Batch", "Due date", "Status", "View"]
            }
            rows={rows}
            loading={resource.loading}
            error={resource.error}
            onRetry={resource.load}
            empty={{
              title: "No assignments",
              text: "Published assignment briefs will appear here.",
            }}
            renderRow={item => (
              <AssignmentRow
                key={item._id}
                assignment={item}
                canEdit={canEdit}
                canDelete={canDelete}
                closingId={closingId}
                onClose={closeAssignment}
                onEdit={assignment => {
                  setEditingAssignment(assignment);
                  setForm({
                    title: assignment.title || "",
                    description: assignment.description || "",
                    dueDate: assignment.dueDate || "",
                    batch: assignment.batch?._id || assignment.batch || "",
                  });
                  setSubmitError("");
                  setOpen(true);
                }}
                onView={setSelectedAssignment}
              />
            )}
          />
        </CardBody>
      </Card>
      <AssignmentDetailModal
        isOpen={Boolean(selectedAssignment)}
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
      />
      <AssignmentCreateModal
        isOpen={open}
        form={form}
        batches={batchOptions}
        error={submitError}
        onClose={() => setOpen(false)}
        onChange={updateForm}
        onSubmit={editingAssignment ? saveAssignment : create}
        mode={editingAssignment ? "edit" : "create"}
      />
    </>
  );
}
