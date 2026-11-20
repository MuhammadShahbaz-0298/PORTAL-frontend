/* Reusable comment thread for a submission. */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "./ui/Button";
import Textarea from "./ui/Textarea";

export default function CommentThread({ submissionId }) {
  const dispatch = useDispatch();
  const { items, loading, error, body, saving, formError } = useSelector(
    state => state.comments
  );
  const [localBody, setLocalBody] = useState(body || "");

  useEffect(() => {
    if (submissionId) dispatch.comments.load(submissionId);
    return () => dispatch.comments.reset();
  }, [dispatch, submissionId]);

  useEffect(() => {
    setLocalBody(body || "");
  }, [body]);

  const submit = async event => {
    event.preventDefault();
    if (!localBody.trim()) return;
    const ok = await dispatch.comments.create({
      submissionId,
      body: localBody,
    });
    if (ok) setLocalBody("");
  };

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-ink">Comments</h3>
      {loading ? <p className="text-xs text-muted">Loading…</p> : null}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      <ul className="mt-2 space-y-2">
        {items.map(c => (
          <li key={c._id || c.id} className="rounded-control border border-line bg-canvas p-2 text-sm">
            <p className="text-ink">{c.text}</p>
            <p className="text-xs text-muted">
              {c.author?.name || "User"}
              {c.createdAt ? ` · ${new Date(c.createdAt).toLocaleString()}` : ""}
            </p>
          </li>
        ))}
      </ul>
      <form onSubmit={submit} className="mt-3 grid gap-2">
        <Textarea
          rows={2}
          value={localBody}
          onChange={e => setLocalBody(e.target.value)}
          placeholder="Add a comment"
        />
        {formError ? <p className="text-xs text-danger">{formError}</p> : null}
        <Button type="submit" loading={saving} className="justify-self-start">
          Post comment
        </Button>
      </form>
    </div>
  );
}