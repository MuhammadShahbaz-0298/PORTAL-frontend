/* AnnouncementFormModal: validate and publish school or batch announcements.
 * Audience and batch selection are managed by AnnouncementAudienceFields.
 */
import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Textarea from "../../components/ui/Textarea";
import AnnouncementAudienceFields from "./AnnouncementAudienceFields";

export default function AnnouncementFormModal({
  announcements,
  currentUser,
  loadBatches,
  closeForm,
  create,
}) {
  const isTeacher = currentUser?.role === "teacher";
  const [form, setForm] = useState({
    title: "",
    body: "",
    scope: isTeacher ? "batch" : "school",
    batchId: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentUser?.role === "teacher" || currentUser?.role === "admin") {
      loadBatches();
    }
  }, [currentUser?.role, loadBatches]);

  const submit = async event => {
    event.preventDefault();
    const scope = isTeacher ? "batch" : form.scope;
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.body.trim()) nextErrors.body = "Body is required.";
    if (scope === "batch" && !form.batchId) {
      nextErrors.batchId = "Choose a batch.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    await create({
      title: form.title.trim(),
      body: form.body.trim(),
      scope,
      batchId: scope === "batch" ? form.batchId : undefined,
    });
  };

  return (
    <Modal
      open
      onClose={closeForm}
      title="New announcement"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={closeForm}
            disabled={announcements.saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="announcement-form"
            loading={announcements.saving}
          >
            Publish
          </Button>
        </>
      }
    >
      <form id="announcement-form" onSubmit={submit} className="grid gap-4">
        <FormField
          label="Title"
          htmlFor="ann-title"
          required
          error={errors.title}
        >
          <Input
            id="ann-title"
            value={form.title}
            maxLength={200}
            required
            invalid={Boolean(errors.title)}
            onChange={event =>
              setForm(current => ({ ...current, title: event.target.value }))
            }
          />
        </FormField>
        <FormField label="Body" htmlFor="ann-body" required error={errors.body}>
          <Textarea
            id="ann-body"
            rows={5}
            value={form.body}
            maxLength={5000}
            required
            invalid={Boolean(errors.body)}
            onChange={event =>
              setForm(current => ({ ...current, body: event.target.value }))
            }
          />
        </FormField>
        <AnnouncementAudienceFields
          announcements={announcements}
          currentUser={currentUser}
          form={form}
          setForm={setForm}
          error={errors.batchId}
        />
        {announcements.formError ? (
          <div
            role="alert"
            className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
          >
            {announcements.formError}
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
