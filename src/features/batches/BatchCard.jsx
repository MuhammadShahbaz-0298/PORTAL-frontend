import { Pencil, Trash2, UserPlus } from "lucide-react";
import { Button, Card, CardBody } from "reactstrap";
import { getLearnerCount } from "./batchUtils";

export default function BatchCard({ batch, canManage, onEnroll, onEdit, onDelete }) {
  return (
    <Card className="batch-card">
      <CardBody>
        <div className="eyebrow">Batch</div>
        <h2>{batch.name}</h2>
        <p>{batch.teacher?.name || batch.teacher || "Teacher not assigned"}</p>
        <div className="batch-card-footer">
          <span className="muted">{getLearnerCount(batch)} learners</span>
          {canManage && (
            <div className="batch-actions">
              <Button color="light" onClick={() => onEnroll(batch)}>
                <UserPlus size={15} /> Enroll
              </Button>
              <Button color="light" onClick={() => onEdit(batch)}>
                <Pencil size={15} /> Edit
              </Button>
              <Button color="light" onClick={() => onDelete(batch)} className="btn-delete-soft">
                <Trash2 size={15} /> Delete
              </Button>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
