/* WeightedGradeCard: shows only the score and components returned by the API. */
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hasPermission } from "../../lib/permissions";
import Card from "./Card";
import Spinner from "./Spinner";

export default function WeightedGradeCard({ studentId, batchId }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const weightedGrades = useSelector(state => state.weightedGrades);
  const canView = hasPermission(user, "grades.view");
  const key = `${studentId}:${batchId}`;

  useEffect(() => {
    if (canView && studentId && batchId) {
      dispatch.weightedGrades.load({ studentId, batchId });
    }
  }, [canView, dispatch, studentId, batchId]);

  if (!canView || !studentId || !batchId) return null;

  const current = weightedGrades.key === key ? weightedGrades.data : null;
  const loading = weightedGrades.loading;
  const error = weightedGrades.key === key ? weightedGrades.error : "";
  const score = current?.weightedScore;

  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
        Assessment
      </p>
      <h3 className="mt-1 font-sans text-lg font-semibold text-ink">
        Weighted grade
      </h3>

      {loading ? (
        <div className="mt-3">
          <Spinner size="sm" label="Loading weighted grade" className="text-brand" />
        </div>
      ) : null}

      {!loading && error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-danger">{error}</p>
      ) : null}

      {!loading && current ? (
        <>
          {current.message ? (
            <p className="mt-2 text-sm text-muted">{current.message}</p>
          ) : null}
          <p className="mt-2 text-3xl font-semibold tabular-nums text-ink">
            {typeof score === "number" ? `${score}%` : "—"}
          </p>
          {current.components ? (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {Object.entries(current.components).map(([name, value]) => (
                <li key={name} className="rounded-control bg-canvas px-3 py-2">
                  <p className="text-xs font-medium capitalize text-muted">{name}</p>
                  <p className="text-sm font-semibold tabular-nums text-ink">
                    {typeof value === "number" ? `${value.toFixed(2)}%` : "—"}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
          {Array.isArray(current.weights) && current.weights.length ? (
            <p className="mt-3 text-xs text-muted">
              Weights: {current.weights.map(weight => `${weight.component} ${weight.weight}`).join(" · ")}
            </p>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}
