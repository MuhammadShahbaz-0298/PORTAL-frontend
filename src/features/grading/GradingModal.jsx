/* GradingModal: grade one submission and keep every failure inline. */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Textarea from "../../components/ui/Textarea";
import { assignmentName, personName } from "./gradingUtils";

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
  const { editing, formOpen, formError, saving } = useSelector(
    state => state.grading
  );
  const [form, setForm] = useState({ grade: "", feedback: "" });
  const [errors, setErrors] = useState({});

  // Why: the editor opens with the current grade and clears after a close.
  useEffect(() => {
    if (formOpen) {
      setForm({
        grade: editing?.grade ?? "",
        feedback: editing?.feedback ?? "",
      });
      setErrors({});
      return;
    }

    setForm({ grade: "", feedback: "" });
    setErrors({});
  }, [formOpen, editing]);

  const close = () => {
    if (!saving) dispatch.grading.closeEditor();
  };

  const submit = async event => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    await dispatch.grading.save({
      id: editing?._id || editing?.id,
      grade: String(form.grade),
      feedback: form.feedback.trim(),
      wasGraded: editing?.status === "graded",
    });
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

        {formError ? (
          <div
            role="alert"
            className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
          >
            {formError}
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
