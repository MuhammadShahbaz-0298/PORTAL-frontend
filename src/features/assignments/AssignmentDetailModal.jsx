import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { CalendarClock, FolderOpen, NotebookPen } from "lucide-react";

const formatDateTime = value => {
  if (!value) return "Not set";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export default function AssignmentDetailModal({
  isOpen,
  assignment,
  onClose,
}) {
  if (!assignment) return null;

  const status =
    assignment.active === false
      ? "Closed"
      : new Date(assignment.dueDate) <= new Date()
        ? "Expired"
        : "Open";

  return (
    <Modal
      isOpen={isOpen}
      toggle={onClose}
      fade={false}
      centered
      size="lg"
      className="assignment-detail-modal"
      contentClassName="assignment-detail-modal-content"
    >
      <ModalHeader toggle={onClose} className="assignment-detail-header">
        <div className="assignment-modal-title-wrap">
          <span className="assignment-modal-kicker">Assignment brief</span>
          <strong>Details</strong>
        </div>
      </ModalHeader>
      <ModalBody className="assignment-detail-body">
        <div className="assignment-detail-hero">
          <div className="assignment-detail-icon">
            <NotebookPen size={22} />
          </div>
          <div>
            <h3>{assignment.title || "Untitled assignment"}</h3>
            <span className={`assignment-modal-status ${status.toLowerCase()}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="assignment-detail-grid">
          <div className="assignment-detail-metric">
            <span className="metric-label">
              <FolderOpen size={14} /> Batch
            </span>
            <strong>
              {assignment.batch?.name || assignment.batch || "Unassigned"}
            </strong>
          </div>
          <div className="assignment-detail-metric">
            <span className="metric-label">
              <CalendarClock size={14} /> Deadline
            </span>
            <strong>{formatDateTime(assignment.dueDate)}</strong>
          </div>
        </div>

        <div className="assignment-detail-section">
          <span className="section-label">Description</span>
          <p>
            {assignment.description ||
              "No description has been provided for this assignment."}
          </p>
        </div>

        <div className="assignment-detail-actions">
          <Button color="secondary" onClick={onClose} className="btn-soft-dark">
            Close
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
}
