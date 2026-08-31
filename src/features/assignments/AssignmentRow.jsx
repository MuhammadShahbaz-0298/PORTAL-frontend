import { Archive, Edit3, Eye } from "lucide-react";
import { Button } from "reactstrap";
import { getAssignmentStatus } from "./assignmentUtils";

export default function AssignmentRow({
  assignment,
  canEdit,
  canDelete,
  closingId,
  onClose,
  onEdit,
  onView,
}) {
  const status = getAssignmentStatus(assignment);

  return (
    <tr
      className="assignment-row"
      onClick={() => onView(assignment)}
      style={{ cursor: "pointer" }}
    >
      <td>
        <div className="assignment-title-wrap">
          <strong>{assignment.title}</strong>
          <span className="row-sub">
            ZIP · {assignment.maxFileSizeMb || 50} MB maximum
          </span>
        </div>
      </td>
      <td>{assignment.batch?.name || assignment.batch || "Unassigned"}</td>
      <td>
        {assignment.dueDate
          ? new Date(assignment.dueDate).toLocaleString()
          : "—"}
      </td>
      <td>
        <span
          className={`assignment-status assignment-status-${status.toLowerCase()}`}
        >
          {status}
        </span>
      </td>
      <td>
        <Button
          color="light"
          className="table-action table-action-primary"
          onClick={event => {
            event.stopPropagation();
            onView(assignment);
          }}
        >
          <Eye size={14} /> View
        </Button>
      </td>
      {(canEdit || canDelete) && (
        <td>
          {canEdit && assignment.active !== false && (
            <Button
              color="light"
              className="table-action"
              onClick={event => {
                event.stopPropagation();
                onEdit(assignment);
              }}
            >
              <Edit3 size={14} /> Edit
            </Button>
          )}
          {canDelete && assignment.active !== false ? (
            <Button
              color="light"
              className="table-action"
              disabled={closingId === assignment._id}
              onClick={event => {
                event.stopPropagation();
                onClose(assignment._id);
              }}
            >
              <Archive size={14} /> {closingId === assignment._id ? "Closing…" : "Close"}
            </Button>
          ) : !canEdit && assignment.active === false ? (
            <span className="muted">Closed</span>
          ) : null}
        </td>
      )}
    </tr>
  );
}
