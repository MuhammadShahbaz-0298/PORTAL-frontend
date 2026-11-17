/* AiDraftPanel: shows a teacher's AI draft. It never saves a grade by itself. */
import { Sparkles } from "lucide-react";
import Button from "../../components/ui/Button";
import { draftItems, draftMarks } from "./gradingUtils";

const NOTES = {
  pending: "Drafting... this can take a few minutes.",
  failed: "The draft could not be generated. You can try again.",
  discarded: "This draft was discarded. You can generate a new one.",
  applied:
    "Draft already applied. Edit the marks and feedback below as you like.",
  stalled: "Still drafting. Press Refresh to check again.",
};

/* Small list of plain text lines; no HTML is ever rendered here. */
function DraftList({ title, items }) {
  if (!items.length) return null;

  return (
    <div>
      <p className="text-xs font-medium text-muted">{title}</p>
      <ul className="mt-1 grid list-disc gap-1 pl-4 text-sm text-ink">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="whitespace-pre-wrap">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AiDraftPanel({
  draft,
  busy,
  error,
  timedOut = false,
  onUseDraft,
  onRegenerate,
  onDiscard,
  onRefresh,
}) {
  if (!draft) return null;

  // Why: an older draft may arrive without a status; showing it is more useful.
  const status = draft.status || "ready";
  const marks = draftMarks(draft);
  const feedback = String(draft.feedback || "").trim();

  return (
    <section
      aria-label="AI suggestion"
      className="grid gap-3 rounded-control border border-brand/30 bg-brand-soft/50 p-3"
    >
      <div className="flex items-start gap-2">
        <Sparkles
          size={16}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-brand"
        />
        <div>
          <p className="text-sm font-semibold text-ink">
            AI suggestion. You decide the final grade.
          </p>
          <p className="text-xs text-muted">
            Nothing is saved until you press the Save button.
          </p>
        </div>
      </div>

      {status === "ready" ? (
        <>
          <div className="grid gap-3 rounded-control border border-line bg-surface p-3">
            <p className="text-sm text-ink">
              <span className="block text-xs font-medium text-muted">
                Suggested marks
              </span>
              <span className="font-semibold">
                {marks === null ? "No marks suggested" : marks}
              </span>
            </p>

            <DraftList title="Strengths" items={draftItems(draft.strengths)} />
            <DraftList
              title="Improvements"
              items={draftItems(draft.improvements)}
            />

            {feedback ? (
              <div>
                <p className="text-xs font-medium text-muted">Draft feedback</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink">
                  {feedback}
                </p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={onUseDraft} disabled={busy}>
              Use draft
            </Button>
            <Button variant="secondary" onClick={onDiscard} loading={busy}>
              Discard
            </Button>
          </div>
        </>
      ) : null}

      {status === "pending" ? (
        <div className="grid gap-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink">{NOTES.pending}</p>
            <Button
              variant="secondary"
              onClick={onRefresh}
              loading={busy}
              className="shrink-0 whitespace-nowrap"
            >
              Refresh
            </Button>
          </div>
          {timedOut ? (
            <p className="text-sm text-muted">{NOTES.stalled}</p>
          ) : null}
        </div>
      ) : null}

      {status === "failed" || status === "discarded" ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink">{NOTES[status]}</p>
          <Button
            variant="secondary"
            onClick={onRegenerate}
            loading={busy}
            className="shrink-0 whitespace-nowrap"
          >
            Generate again
          </Button>
        </div>
      ) : null}

      {status === "used" || status === "edited" ? (
        <p className="text-sm text-muted">{NOTES.applied}</p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
}
