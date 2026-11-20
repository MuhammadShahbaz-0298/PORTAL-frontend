/* Comments model: thread for one submission. */
import { listComments, createComment, archiveComment } from "../../api/comments";
import { apiError } from "../../api/client";

export const comments = {
  state: {
    submissionId: null,
    items: [],
    loading: false,
    error: "",
    formError: "",
    saving: false,
    body: "",
  },
  reducers: {
    setSubmissionId(state, submissionId) { return { ...state, submissionId }; },
    setLoading(state, loading) { return { ...state, loading }; },
    setError(state, error) { return { ...state, error }; },
    setItems(state, items) { return { ...state, items }; },
    setBody(state, body) { return { ...state, body }; },
    setFormError(state, formError) { return { ...state, formError }; },
    setSaving(state, saving) { return { ...state, saving }; },
    reset(state) { return { ...state, items: [], submissionId: null, body: "", error: "", formError: "" }; },
  },
  effects: () => ({
    async load(submissionId) {
      this.setSubmissionId(submissionId);
      this.setLoading(true);
      this.setError("");
      try {
        const { data } = await listComments(submissionId);
        const list = Array.isArray(data) ? data : data?.items || [];
        this.setItems(list);
      } catch (error) {
        this.setError(apiError(error));
      } finally {
        this.setLoading(false);
      }
    },
    async create({ submissionId, body }) {
      this.setFormError("");
      this.setSaving(true);
      try {
        await createComment(submissionId, { text: body.trim() });
        this.setBody("");
        await this.load(submissionId);
        return true;
      } catch (error) {
        this.setFormError(apiError(error));
        return false;
      } finally {
        this.setSaving(false);
      }
    },
    async archive({ submissionId, id }) {
      try {
        await archiveComment(submissionId, id);
        await this.load(submissionId);
      } catch (error) {
        this.setError(apiError(error));
      }
    },
  }),
};