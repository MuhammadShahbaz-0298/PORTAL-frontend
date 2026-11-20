/* AnnouncementAudienceFields: choose school-wide or batch-specific recipients.
 * Teachers are restricted to batch announcements.
 */
import FormField from "../../components/ui/FormField";
import SearchSelect from "../../components/ui/SearchSelect";

export default function AnnouncementAudienceFields({
  announcements,
  currentUser,
  form,
  setForm,
  error,
}) {
  const isTeacher = currentUser?.role === "teacher";
  const batchOptions = announcements.batches.map(batch => ({
    value: batch._id || batch.id,
    label: batch.name || "Untitled batch",
  }));

  return (
    <>
      {currentUser?.role === "admin" ? (
        <FormField label="Audience" htmlFor="ann-scope">
          <SearchSelect
            id="ann-scope"
            value={form.scope}
            onChange={value =>
              setForm(current => ({
                ...current,
                scope: value || "school",
                batchId: "",
              }))
            }
            options={[
              { value: "school", label: "Whole school" },
              { value: "batch", label: "Specific batch" },
            ]}
            placeholder="Choose audience"
          />
        </FormField>
      ) : null}
      {isTeacher || form.scope === "batch" ? (
        <FormField
          label="Batch"
          htmlFor="ann-batch"
          required
          error={error}
          hint={
            !announcements.batchesLoading &&
            !announcements.batchError &&
            !batchOptions.length
              ? "No batches are available."
              : undefined
          }
        >
          <SearchSelect
            id="ann-batch"
            value={form.batchId}
            onChange={value =>
              setForm(current => ({ ...current, batchId: value || "" }))
            }
            options={batchOptions}
            placeholder="Choose a batch"
            disabled={announcements.batchesLoading}
            invalid={Boolean(error)}
          />
        </FormField>
      ) : null}
      {announcements.batchError ? (
        <p
          role="alert"
          className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
        >
          Could not load batches: {announcements.batchError}
        </p>
      ) : null}
    </>
  );
}
