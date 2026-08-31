import { Pencil, Trash2, UserPlus } from "lucide-react";
import { Button, Card, CardBody } from "reactstrap";
import { getLearnerCount } from "./batchUtils";

export default function BatchCard({ batch, canEdit, canDelete, canEnroll, onEnroll, onEdit, onDelete }) {
  return (
    <Card className="batch-card">
      <CardBody>
        <div className="eyebrow">Batch</div>
        <h2>{batch.name}</h2>
        <p>{batch.teacher?.name || batch.teacher || "Teacher not assigned"}</p>
        <div className="batch-card-footer">
          <span className="muted">{getLearnerCount(batch)} learners</span>
          {(canEdit || canDelete || canEnroll) && (
            <div className="batch-actions">
              {canEnroll && <Button color="light" onClick={() => onEnroll(batch)}>
                <UserPlus size={15} /> Enroll
              </Button>}
              {canEdit && <Button color="light" onClick={() => onEdit(batch)}>
                <Pencil size={15} /> Edit
              </Button>}
              {canDelete && <Button color="light" onClick={() => onDelete(batch)} className="btn-delete-soft">
                <Trash2 size={15} /> Delete
              </Button>}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
