/* Grading model: the submission queue, filters, and the grade editor. */
import { gradeSubmission, listSubmissions } from "../../api/submissions";
import { apiError } from "../../api/client";
import { listHelper } from "../../lib/listHelper";

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
      };
    },
    closeEditor(state) {
      return { ...state, editing: null, formOpen: false, formError: "" };
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
  }),
};
