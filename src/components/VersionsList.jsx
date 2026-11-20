/* Collapsible previous versions list. */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function VersionsList({ submissionId }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { versions, versionsSubmissionId, versionsLoading, versionsError } =
    useSelector(state => state.submissions);

  useEffect(() => {
    if (!open || !submissionId) return;
    dispatch.submissions.loadVersions(submissionId);
  }, [dispatch, open, submissionId]);

  const visibleVersions =
    versionsSubmissionId === submissionId ? versions : [];
  const visibleError =
    versionsSubmissionId === submissionId ? versionsError : "";
  const loading = open && versionsLoading && versionsSubmissionId === submissionId;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="text-xs font-semibold text-brand hover:underline"
      >
        {open ? "Hide" : "Show"} previous versions
      </button>
      {open ? (
        <ul className="mt-2 space-y-1">
          {loading ? <li className="text-xs text-muted">Loading…</li> : null}
          {visibleError ? (
            <li role="alert" className="text-xs font-medium text-danger">
              Could not load versions: {visibleError}
            </li>
          ) : null}
          {visibleVersions.map((version, index) => (
            <li key={index} className="text-xs text-muted">
              Version {index + 1} ·{" "}
              {version.createdAt ? new Date(version.createdAt).toLocaleString() : ""}
            </li>
          ))}
          {!loading && !visibleError && !visibleVersions.length ? (
            <li className="text-xs text-muted">No previous versions.</li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
