/* Timetable model: weekly entries, staff batch chooser, and staff writes. */
import {
  archiveTimetableEntry,
  createTimetableEntry,
  listTimetable,
  updateTimetableEntry,
} from "../../api/timetable";
import { listBatches } from "../../api/batches";
import { apiError } from "../../api/client";
import { toCollection } from "../../lib/apiData";
import { loadList } from "../../lib/listHelper";

export const timetable = {
  state: {
    items: [],
    total: 0,
    loading: true,
    error: "",
    batches: [],
    batchesLoading: false,
    batchId: "",
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
    setBatches(state, batches) {
      return { ...state, batches };
    },
    setBatchesLoading(state, batchesLoading) {
      return { ...state, batchesLoading };
    },
    setBatchId(state, batchId) {
      return { ...state, batchId };
    },
    openForm(state, entry) {
      return {
        ...state,
        formOpen: true,
        editing: entry || null,
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
    async load({ batchId } = {}) {
      this.setBatchId(batchId || "");
      return loadList(this, () => listTimetable(batchId ? { batchId } : undefined));
    },

    async loadBatches() {
      this.setBatchesLoading(true);
      try {
        const response = await listBatches();
        this.setBatches(toCollection(response.data));
      } catch {
        this.setBatches([]);
      } finally {
        this.setBatchesLoading(false);
      }
    },

    async selectBatch(batchId) {
      const id =
        typeof batchId === "string"
          ? batchId
          : batchId?.target?.value ?? batchId?.batchId ?? "";
      this.setBatchId(id);
      await this.load({ batchId: id });
    },

    async save({ entry, payload, batchId }) {
      this.setSaving(true);
      this.setFormError("");
      try {
        const id = entry?._id || entry?.id;
        if (id) {
          await updateTimetableEntry(id, payload);
          this.setNotice("Timetable entry updated.");
        } else {
          await createTimetableEntry(payload);
          this.setNotice("Timetable entry added.");
        }
        this.closeForm();
        await this.load({ batchId });
        return true;
      } catch (error) {
        this.setFormError(apiError(error));
        return false;
      } finally {
        this.setSaving(false);
      }
    },

    async archive({ id, batchId }) {
      this.setArchivingId(id);
      this.setNotice("");
      this.setPageError("");
      try {
        await archiveTimetableEntry(id);
        this.setNotice("Timetable entry archived.");
        await this.load({ batchId });
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
