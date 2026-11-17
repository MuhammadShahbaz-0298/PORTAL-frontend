/* Grading model: the submission queue, filters, and the grade editor. */
import {
  discardAiDraft,
  generateAiDraft,
  gradeSubmission,
  listSubmissions,
} from "../../api/submissions";
import { apiError } from "../../api/client";
import { listHelper } from "../../lib/listHelper";

const rowId = row => row?._id || row?.id;

/* Re-read the queue without the loading flash and swap in the fresh row.
   Why: the queue is paged, so the row can be missing; the modal keeps what it has. */
async function syncRow(model, id) {
  const response = await listSubmissions();
  const { items, total } = listHelper(response);
  model.setLoaded({ items, total });

  const fresh = items.find(item => rowId(item) === id);
  if (fresh) model.setEditing(fresh);
  return Boolean(fresh);
}

export const grading = {
  state: {
    items: [],
    total: 0,
    loading: true,
    error: "",
    query: "",
    filter: "all",
    editing: null,
    formOpen: false,
    formError: "",
    saving: false,
    notice: "",
    pageError: "",
    aiBusy: false,
    aiError: "",
  },

  reducers: {
    setQuery(state, query) {
      return { ...state, query };
    },
    setFilter(state, filter) {
      return { ...state, filter };
    },
    setLoading(state, loading) {
      return { ...state, loading };
    },
    setError(state, error) {
      return { ...state, error };
    },
    setLoaded(state, { items, total }) {
      return { ...state, items, total };
    },
    openEditor(state, submission) {
      return {
        ...state,
        editing: submission,
        formOpen: true,
        formError: "",
        aiBusy: false,
        aiError: "",
      };
    },
    closeEditor(state) {
      return {
        ...state,
        editing: null,
        formOpen: false,
        formError: "",
        aiBusy: false,
        aiError: "",
      };
    },
    setEditing(state, submission) {
      // Why: a late AI response must never reopen a closed editor or swap submissions.
      if (!state.formOpen || !submission) return state;
      if (rowId(state.editing) !== rowId(submission)) return state;
      return { ...state, editing: submission };
    },
    setDraft(state, { id, aiDraft }) {
      // Why: a late poll must never reopen a closed editor or touch another
      // submission. Only the draft changes; marks and feedback stay as typed.
      if (!state.formOpen || !aiDraft) return state;
      if (rowId(state.editing) !== id) return state;
      return { ...state, editing: { ...state.editing, aiDraft } };
    },
    setDraftStatus(state, status) {
      if (!state.formOpen || !state.editing?.aiDraft) return state;
      return {
        ...state,
        editing: {
          ...state.editing,
          aiDraft: { ...state.editing.aiDraft, status },
        },
      };
    },
    setAiBusy(state, aiBusy) {
      return { ...state, aiBusy };
    },
    setAiError(state, aiError) {
      return { ...state, aiError };
    },
    setFormError(state, formError) {
      return { ...state, formError };
    },
    setSaving(state, saving) {
      return { ...state, saving };
    },
    setNotice(state, notice) {
      return { ...state, notice };
    },
    setPageError(state, pageError) {
      return { ...state, pageError };
    },
    clearMessages(state) {
      return { ...state, notice: "", pageError: "" };
    },
  },

  effects: () => ({
    async load() {
      this.setLoading(true);
      this.setError("");
      try {
        const response = await listSubmissions();
        const { items, total } = listHelper(response);
        this.setLoaded({ items, total });
        return items;
      } catch (error) {
        this.setError(apiError(error));
        return [];
      } finally {
        this.setLoading(false);
      }
    },

    async save({ id, grade, feedback, wasGraded }) {
      this.setFormError("");
      this.setSaving(true);

      try {
        await gradeSubmission(id, {
          grade,
          feedback,
          status: "graded",
        });

        this.closeEditor();
        this.setNotice(
          wasGraded
            ? "Grade and feedback updated."
            : "Submission graded successfully."
        );
        await this.load();
        return true;
      } catch (error) {
        this.setFormError(apiError(error));
        return false;
      } finally {
        this.setSaving(false);
      }
    },

    // Refresh a running draft: quiet, never touches the typed marks or feedback.
    async refreshDraft({ id }) {
      this.setAiError("");
      this.setAiBusy(true);
      try {
        await syncRow(this, id);
      } catch (error) {
        this.setAiError(apiError(error));
      } finally {
        this.setAiBusy(false);
      }
    },

    // Quiet poll for a pending draft: no loading flash, no busy spinner.
    async pollDraft({ id }) {
      try {
        const response = await listSubmissions();
        const { items, total } = listHelper(response);
        this.setLoaded({ items, total });

        const fresh = items.find(item => rowId(item) === id);
        if (fresh?.aiDraft) this.setDraft({ id, aiDraft: fresh.aiDraft });
      } catch {
        // Why: polling is best effort; the next tick or Refresh retries.
      }
    },

    // Ask the backend for a new draft; the teacher still saves nothing here.
    async regenerateDraft({ id }) {
      this.setAiError("");
      this.setAiBusy(true);
      try {
        await generateAiDraft(id);
        // Why: a new draft starts as pending even when the row is not on this page.
        this.setDraftStatus("pending");
        await syncRow(this, id);
      } catch (error) {
        this.setAiError(apiError(error));
      } finally {
        this.setAiBusy(false);
      }
    },

    async discardDraft({ id }) {
      this.setAiError("");
      this.setAiBusy(true);
      try {
        await discardAiDraft(id);
        this.setDraftStatus("discarded");
      } catch (error) {
        this.setAiError(apiError(error));
        this.setAiBusy(false);
        return;
      }

      try {
        await syncRow(this, id);
      } catch {
        // Why: the discard already went through; a stale queue row can wait.
      } finally {
        this.setAiBusy(false);
      }
    },
  }),
};
