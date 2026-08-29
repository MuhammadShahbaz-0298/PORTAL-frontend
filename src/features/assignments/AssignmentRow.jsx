import { Archive } from "lucide-react";
import { Button } from "reactstrap";
import { getAssignmentStatus } from "./assignmentUtils";

export default function AssignmentRow({
  assignment,
  canManage,
  closingId,
  onClose,
}) {
  const status = getAssignmentStatus(assignment);

  return (
    <tr>
      <td>
        <strong>{assignment.title}</strong>
        <span className="row-sub">
          ZIP · {assignment.maxFileSizeMb || 50} MB maximum
        </span>
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
      {canManage && (
        <td>
          {assignment.active === false ? (
            <span className="muted">Closed</span>
          ) : (
            <Button
              color="light"
              className="table-action"
              disabled={closingId === assignment._id}
              onClick={() => onClose(assignment._id)}
            >
              <Archive size={14} />{" "}
              {closingId === assignment._id ? "Closing…" : "Close"}
            </Button>
          )}
        </td>
      )}
    </tr>
  );
}
