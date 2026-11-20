import {
  archiveEvent,
  createEvent,
  listEvents,
  updateEvent,
} from "../../api/events";
import { apiError } from "../../api/client";
import { loadList } from "../../lib/listHelper";

export const events = {
  state: {
    items: [],
    total: 0,
    loading: true,
    error: "",
    formOpen: false,
    editing: null,
    formError: "",
    saving: false,
    archivingId: "",
    notice: "",
    pageError: "",
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
    openForm(state, event = null) {
      return {
        ...state,
        formOpen: true,
        editing: event || null,
        formError: "",
        notice: "",
        pageError: "",
      };
    },
    closeForm(state) {
      return { ...state, formOpen: false, editing: null, formError: "" };
    },
    setFormError(state, formError) {
      return { ...state, formError };
    },
    setSaving(state, saving) {
      return { ...state, saving };
    },
    setArchivingId(state, archivingId) {
      return { ...state, archivingId };
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
      return loadList(this, listEvents);
    },

    async save({ id, values }) {
      this.setSaving(true);
      this.setFormError("");
      this.setNotice("");
      try {
        if (id) await updateEvent(id, values);
        else await createEvent(values);
        this.setNotice(id ? "Event updated." : "Event added.");
        this.closeForm();
        await this.load();
        return true;
      } catch (error) {
        this.setFormError(apiError(error));
        return false;
      } finally {
        this.setSaving(false);
      }
    },

    async archive({ id }) {
      this.setArchivingId(id);
      this.setNotice("");
      this.setPageError("");
      try {
        await archiveEvent(id);
        this.setNotice("Event archived.");
        await this.load();
        return true;
      } catch (error) {
        this.setPageError(apiError(error));
        return false;
      } finally {
        this.setArchivingId("");
      }
    },
  }),
};
