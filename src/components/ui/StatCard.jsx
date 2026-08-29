/* StatCard: shared metric display used by role-specific dashboards. */
import { Card, CardBody } from "reactstrap";
export default function StatCard({ label, value, note, tone = "ink" }) {
  return (
    <Card className={`stat-card stat-${tone}`}>
      <CardBody>
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        <span className="stat-note">{note}</span>
      </CardBody>
    </Card>
  );
}
