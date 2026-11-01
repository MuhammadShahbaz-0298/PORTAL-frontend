/* BatchFormModal: create or rename a batch and assign its teacher. */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import SearchSelect from "../../components/ui/SearchSelect";
import { teacherName } from "./batchUtils";

const EMPTY_FORM = { name: "", teacherId: "" };

function validate(form) {
  const errors = {};

  if (!form.name.trim()) errors.name = "Give this batch a name.";
  if (!form.teacherId) errors.teacherId = "Choose the teacher who owns it.";

  return errors;
}

export default function BatchFormModal() {
  const dispatch = useDispatch();
  const { formOpen, editing, formError, saving, teachers, peopleLoading } =
    useSelector(state => state.batches);
  const user = useSelector(state => state.auth.user);
  const isAdmin = user?.role === "admin";
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const teacherOptions = useMemo(() => {
    const options = teachers.map(teacher => ({
      value: teacher._id || teacher.id,
      label: `${teacherName(teacher)}${teacher.email ? ` · ${teacher.email}` : ""}`,
    }));
    const existingId = editing?.teacher?._id || editing?.teacher?.id;
    const existingValue = existingId || editing?.teacher;

    if (
      existingValue &&
      !options.some(option => String(option.value) === String(existingValue))
    ) {
      options.push({
        value: existingValue,
        label: teacherName(editing?.teacher),
      });
    }

    return options;
  }, [teachers, editing]);

  // Why: the same modal handles create and edit, so it resets on every open.
  useEffect(() => {
    if (!formOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
      return;
    }

    setForm({
      name: editing?.name || "",
      teacherId:
        editing?.teacher?._id || editing?.teacher?.id || editing?.teacher || "",
    });
    setErrors({});
  }, [formOpen, editing]);

  const update = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    setErrors(current => ({ ...current, [field]: "" }));
    if (formError) dispatch.batches.setFormError("");
  };

  const close = () => dispatch.batches.closeForm();

  const submit = async event => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    await dispatch.batches.save({
      values: { name: form.name.trim(), teacherId: form.teacherId },
    });
  };

  return (
    <Modal
      open={formOpen}
      onClose={close}
      title={editing ? "Edit batch" : "Create batch"}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="batch-form" loading={saving}>
            {editing ? "Save changes" : "Create batch"}
          </Button>
        </>
      }
    >
      <form id="batch-form" onSubmit={submit} noValidate className="grid gap-4">
        <FormField
          label="Batch name"
          htmlFor="batch-name"
          required
          error={errors.name}
        >
          <Input
            id="batch-name"
            value={form.name}
            invalid={Boolean(errors.name)}
            placeholder="e.g. Morning cohort A"
            onChange={event => update("name", event.target.value)}
          />
        </FormField>

        <FormField
          label="Teacher"
          htmlFor="batch-teacher"
          required
          error={errors.teacherId}
          hint={
            isAdmin
              ? peopleLoading
                ? "Loading teachers…"
                : "Only active teachers can own a batch."
              : "Only administrators can reassign the teacher."
          }
        >
          <SearchSelect
            id="batch-teacher"
            aria-label="Teacher"
            placeholder={
              peopleLoading ? "Loading teachers…" : "Choose a teacher"
            }
            options={teacherOptions}
            value={form.teacherId}
            invalid={Boolean(errors.teacherId)}
            disabled={!isAdmin || peopleLoading || saving}
            onChange={value => update("teacherId", value)}
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
