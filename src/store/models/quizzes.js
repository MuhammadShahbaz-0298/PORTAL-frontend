/* Quizzes model. */
import {
  listQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  submitAttempt,
  listAttempts,
} from "../../api/quizzes";
import { apiError } from "../../api/client";
import { loadList } from "../../lib/listHelper";

export const quizzes = {
  state: {
    items: [],
    total: 0,
    current: null,
    attempts: [],
    loading: true,
    error: "",
    pageError: "",
    notice: "",
    formOpen: false,
    formError: "",
    saving: false,
  },
  reducers: {
    setLoading(state, loading) {
      return { ...state, loading };
    },
    setError(state, error) {
      return { ...state, error };
    },
    setLoaded(state, { items, total }) {
      return { ...state, items, total };
    },
    setCurrent(state, current) {
      return { ...state, current };
    },
    setAttempts(state, attempts) {
      return { ...state, attempts };
    },
    setPageError(state, pageError) {
      return { ...state, pageError };
    },
    setNotice(state, notice) {
      return { ...state, notice };
    },
    clearMessages(state) {
      return { ...state, pageError: "", notice: "" };
    },
    openForm(state) {
      return { ...state, formOpen: true, formError: "" };
    },
    closeForm(state) {
      return { ...state, formOpen: false, formError: "" };
    },
    setFormError(state, formError) {
      return { ...state, formError };
    },
    setSaving(state, saving) {
      return { ...state, saving };
    },
  },
  effects: () => ({
    async load() {
      return loadList(this, listQuizzes);
    },
    async loadOne(id) {
      this.setLoading(true);
      this.setError("");
      try {
        const { data } = await getQuiz(id);
        this.setCurrent(data);
      } catch (error) {
        this.setError(apiError(error));
      } finally {
        this.setLoading(false);
      }
    },
    async create(form) {
      this.setFormError("");
      this.setSaving(true);
      try {
        await createQuiz(form);
        this.closeForm();
        this.setNotice("Quiz created.");
        await this.load();
        return true;
      } catch (error) {
        this.setFormError(apiError(error));
        return false;
      } finally {
        this.setSaving(false);
      }
    },
    async archive(id) {
      this.setPageError("");
      this.setSaving(true);
      try {
        await updateQuiz(id, { active: false });
        this.setNotice("Quiz archived. Previous attempts were preserved.");
        await this.load();
        return true;
      } catch (error) {
        this.setPageError(apiError(error));
        return false;
      } finally {
        this.setSaving(false);
      }
    },
    async submitAttempt({ id, answers }) {
      this.setSaving(true);
      this.setPageError("");
      try {
        const { data } = await submitAttempt(id, { answers });
        this.setNotice(`Score: ${data?.score ?? "submitted"}`);
        await this.loadOne(id);
        return data;
      } catch (error) {
        this.setPageError(apiError(error));
        return null;
      } finally {
        this.setSaving(false);
      }
    },
    async loadAttempts(id) {
      try {
        const { data } = await listAttempts(id);
        const list = Array.isArray(data) ? data : data?.items || [];
        this.setAttempts(list);
      } catch (error) {
        this.setError(apiError(error));
      }
    },
  }),
};
