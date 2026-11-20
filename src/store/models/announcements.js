/* Announcements model. */
import {
  listAnnouncements,
  createAnnouncement,
  archiveAnnouncement,
} from "../../api/announcements";
import { listBatches } from "../../api/batches";
import { apiError } from "../../api/client";
import { toCollection } from "../../lib/apiData";
import { loadList } from "../../lib/listHelper";

export const announcements = {
  state: {
    items: [],
    total: 0,
    query: "",
    loading: true,
    error: "",
    pageError: "",
    notice: "",
    formOpen: false,
    formError: "",
    saving: false,
    batches: [],
    batchesLoading: false,
    batchError: "",
  },
  reducers: {
    setQuery(state, query) {
      return { ...state, query };
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
      return { ...state, formOpen: false, formError: "", batchError: "" };
    },
    setFormError(state, formError) {
      return { ...state, formError };
    },
    setSaving(state, saving) {
      return { ...state, saving };
    },
    setBatches(state, batches) {
      return { ...state, batches };
    },
    setBatchesLoading(state, batchesLoading) {
      return { ...state, batchesLoading };
    },
    setBatchError(state, batchError) {
      return { ...state, batchError };
    },
  },
  effects: () => ({
    async load() {
      return loadList(this, listAnnouncements);
    },
    async loadBatches() {
      this.setBatchError("");
      this.setBatchesLoading(true);
      try {
        const response = await listBatches();
        this.setBatches(toCollection(response.data));
        return true;
      } catch (error) {
        this.setBatches([]);
        this.setBatchError(apiError(error));
        return false;
      } finally {
        this.setBatchesLoading(false);
      }
    },
    async create(form) {
      this.setFormError("");
      this.setSaving(true);
      try {
        await createAnnouncement(form);
        this.closeForm();
        this.setNotice(
          "Announcement published. Notifications go to the selected audience; your account is excluded."
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
    async archive(id) {
      this.setPageError("");
      try {
        await archiveAnnouncement(id);
        this.setNotice("Announcement archived.");
        await this.load();
      } catch (error) {
        this.setPageError(apiError(error));
      }
    },
  }),
};
