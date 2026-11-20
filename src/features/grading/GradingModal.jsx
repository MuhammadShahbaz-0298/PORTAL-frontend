/* GradingModal: grade one submission and keep every failure inline. */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import { confirmDialog } from "../../components/ui/ConfirmDialog";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Textarea from "../../components/ui/Textarea";
import WeightedGradeCard from "../../components/ui/WeightedGradeCard";
import AiDraftPanel from "./AiDraftPanel";
import CommentThread from "../../components/CommentThread";
import VersionsList from "../../components/VersionsList";
import { assignmentName, draftMarks, personName } from "./gradingUtils";
import {
  DRAFT_POLL_INTERVAL_MS,
  DRAFT_POLL_TIMEOUT_MS,
} from "../../constants/app";

function validate(form) {
  const errors = {};
  const grade = form.grade === "" ? NaN : Number(form.grade);

  if (form.grade === "" || Number.isNaN(grade)) {
    errors.grade = "Enter marks before saving the grade.";
  } else if (grade < 0 || grade > 100) {
    errors.grade = "Marks must be between 0 and 100.";
  }

  return errors;
}

export default function GradingModal() {
  const dispatch = useDispatch();
  const { editing, formOpen, formError, saving, aiBusy, aiError } = useSelector(
    state => state.grading
  );
  const [form, setForm] = useState({ grade: "", feedback: "" });
  const [rubricScores, setRubricScores] = useState([]);
  const [errors, setErrors] = useState({});
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const [pollRun, setPollRun] = useState(0);

  const editingId = editing?._id || editing?.id;
  const draftPending = editing?.aiDraft?.status === "pending";
  const studentRef = editing?.student;
  const batchRef = editing?.batch;
  const gradeStudentId = typeof studentRef === "string" ? studentRef : studentRef?._id;
  const gradeBatchId = typeof batchRef === "string" ? batchRef : batchRef?._id;

  // Why: refreshing a draft replaces `editing` with a fresh copy, so the effect
  // depends on the submission id. That keeps whatever the teacher typed.
  useEffect(() => {
    if (formOpen) {
      setForm({
        grade: editing?.grade ?? "",
        feedback: editing?.feedback ?? "",
      });
      const items = editing?.assignment?.rubricItems;
      if (Array.isArray(items)) {
        setRubricScores(
          items.map((item, index) => editing?.rubricScores?.[index] ?? "")
        );
      } else {
        setRubricScores([]);
      }
      setErrors({});
      setPollTimedOut(false);
      return;
    }

    setForm({ grade: "", feedback: "" });
    setRubricScores([]);
    setErrors({});
    setPollTimedOut(false);
  }, [formOpen, editingId]);

  // Why: the backend finishes drafts in the background, so a pending draft is
  // re-read every few seconds. Any other status stops the interval right away.
  useEffect(() => {
    if (!formOpen || !draftPending || pollTimedOut || !editingId)
      return undefined;

    const interval = setInterval(() => {
      dispatch.grading.pollDraft({ id: editingId });
    }, DRAFT_POLL_INTERVAL_MS);

    // Why: stop waiting after three minutes; Refresh is still there.
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setPollTimedOut(true);
    }, DRAFT_POLL_TIMEOUT_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [dispatch, editingId, formOpen, draftPending, pollTimedOut, pollRun]);

  // Manual fallback: check once now and restart the wait.
  const refreshNow = () => {
    setPollTimedOut(false);
    setPollRun(value => value + 1);
    dispatch.grading.refreshDraft({ id: editingId });
  };

  const close = () => {
    if (!saving) dispatch.grading.closeEditor();
  };

  const submit = async event => {
    event.preventDefault();
    const rubricItems = editing?.assignment?.rubricItems;
    const hasRubric = Array.isArray(rubricItems) && rubricItems.length > 0;

    if (hasRubric) {
      const nextErrors = {};
      rubricScores.forEach((value, index) => {
        const num = value === "" ? NaN : Number(value);
        if (value === "" || Number.isNaN(num)) nextErrors[`rubric-${index}`] = "Enter marks.";
        else if (num < 0) nextErrors[`rubric-${index}`] = "Marks must be 0 or more.";
      });
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) return;
      const total = rubricScores.reduce((sum, value) => sum + (Number(value) || 0), 0);
      await dispatch.grading.save({
        id: editingId,
        grade: String(total),
        feedback: form.feedback.trim(),
        wasGraded: editing?.status === "graded",
        rubricScores,
      });
      return;
    }

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    await dispatch.grading.save({
      id: editingId,
      grade: String(form.grade),
      feedback: form.feedback.trim(),
      wasGraded: editing?.status === "graded",
    });
  };

  // Copy the draft into the fields only. Saving still needs the Save button.
  const useDraft = async () => {
    const draft = editing?.aiDraft;
    const marks = draftMarks(draft);
    const text = String(draft?.feedback || "").trim();

    if (form.feedback.trim()) {
      const replace = await confirmDialog({
        title: "Replace feedback?",
        text: "Replace your current feedback with the AI draft?",
        confirmText: "Replace feedback",
      });
      if (!replace) return;
    }

    setForm(current => ({
      grade: marks === null ? current.grade : String(marks),
      feedback: text || current.feedback,
    }));
    setErrors(current => ({ ...current, grade: "" }));
    if (formError) dispatch.grading.setFormError("");
  };

  const wasGraded = editing?.status === "graded";

  return (
    <Modal
      open={formOpen}
      onClose={close}
      title={wasGraded ? "Edit grade and feedback" : "Grade submission"}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="grading-form" loading={saving}>
            {wasGraded ? "Save changes" : "Save grade"}
          </Button>
        </>
      }
    >
      <form
        id="grading-form"
        onSubmit={submit}
        noValidate
        className="grid gap-4"
      >
        <div className="rounded-control border border-line bg-canvas px-3 py-2">
          <p className="text-xs font-medium text-muted">Selected submission</p>
          <p className="mt-0.5 text-sm font-semibold text-ink">
            {personName(editing?.student)}
          </p>
          <p className="text-xs text-muted">
            {assignmentName(editing?.assignment)}
          </p>
        </div>

        {gradeStudentId && gradeBatchId ? (
          <WeightedGradeCard
            studentId={gradeStudentId}
            batchId={gradeBatchId}
          />
        ) : null}

        {Array.isArray(editing?.assignment?.rubricItems) &&
        editing.assignment.rubricItems.length > 0 ? (
          <div className="grid gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Rubric criteria
            </p>
            {editing.assignment.rubricItems.map((item, index) => (
              <FormField
                key={index}
                label={item.name || `Criterion ${index + 1}`}
                htmlFor={`rubric-${index}`}
                required
                error={errors[`rubric-${index}`]}
                hint={
                  item.maxScore ? `Max ${item.maxScore}` : "Numeric marks."
                }
              >
                <Input
                  id={`rubric-${index}`}
                  type="number"
                  min="0"
                  max={item.maxScore || 100}
                  step="0.01"
                  value={rubricScores[index] ?? ""}
                  invalid={Boolean(errors[`rubric-${index}`])}
                  onChange={event => {
                    setRubricScores(current => {
                      const next = [...current];
                      next[index] = event.target.value;
                      return next;
                    });
                    setErrors(current => ({ ...current, [`rubric-${index}`]: "" }));
                    if (formError) dispatch.grading.setFormError("");
                  }}
                />
              </FormField>
            ))}
          </div>
        ) : (
          <FormField
            label="Marks"
            htmlFor="grading-marks"
            required
            error={errors.grade}
            hint="Numeric marks from 0 to 100."
          >
            <Input
              id="grading-marks"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.grade}
              invalid={Boolean(errors.grade)}
              onChange={event => {
                setForm(current => ({ ...current, grade: event.target.value }));
                setErrors(current => ({ ...current, grade: "" }));
                if (formError) dispatch.grading.setFormError("");
              }}
            />
          </FormField>
        )}

        <AiDraftPanel
          draft={editing?.aiDraft}
          busy={aiBusy}
          error={aiError}
          timedOut={pollTimedOut}
          onUseDraft={useDraft}
          onDiscard={() => dispatch.grading.discardDraft({ id: editingId })}
          onRegenerate={() =>
            dispatch.grading.regenerateDraft({ id: editingId })
          }
          onRefresh={refreshNow}
        />

        <FormField
          label="Feedback"
          htmlFor="grading-feedback"
          hint="Useful feedback is visible to the learner."
        >
          <Textarea
            id="grading-feedback"
            rows={6}
            value={form.feedback}
            placeholder="Add useful feedback for the learner"
            onChange={event =>
              setForm(current => ({ ...current, feedback: event.target.value }))
            }
          />
        </FormField>

        {editing?.similarityFlag ? (
          <div className="rounded-control border border-warning/30 bg-warning-soft px-3 py-2 text-xs font-medium text-warning">
            Similarity flag: review before grading.
          </div>
        ) : null}

        {formError ? (
          <div
            role="alert"
            className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
          >
            {formError}
          </div>
        ) : null}
      </form>

      <VersionsList submissionId={editingId} />

      <CommentThread submissionId={editingId} />
    </Modal>
  );
}
