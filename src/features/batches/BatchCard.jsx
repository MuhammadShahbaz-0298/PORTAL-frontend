import { UserPlus } from "lucide-react";
import { Button, Card, CardBody } from "reactstrap";
import { getLearnerCount } from "./batchUtils";

export default function BatchCard({ batch, canManage, onEnroll }) {
  return (
    <Card className="batch-card">
      <CardBody>
        <div className="eyebrow">Batch</div>
        <h2>{batch.name}</h2>
        <p>{batch.teacher?.name || batch.teacher || "Teacher not assigned"}</p>
        <div className="batch-card-footer">
          <span className="muted">{getLearnerCount(batch)} learners</span>
          {canManage && (
            <Button color="light" onClick={() => onEnroll(batch)}>
              <UserPlus size={15} /> Enroll students
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
