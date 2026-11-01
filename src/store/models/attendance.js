/* Attendance model: the history list plus the batch checklist register. */
import { listAttendance, markAttendance } from "../../api/attendance";
import { listBatches, listBatchStudents } from "../../api/batches";
import { apiError } from "../../api/client";
import { toCollection } from "../../lib/apiData";
import { listHelper } from "../../lib/listHelper";

const today = () => new Date().toISOString().slice(0, 10);
const studentIdOf = record =>
  typeof record?.student === "object"
    ? record.student?._id || record.student?.id
    : record?.student;

export const attendance = {
  state: {
    items: [],
    total: 0,
    loading: true,
    error: "",
    query: "",
    batches: [],
    batchesLoading: false,
    modalOpen: false,
    batchId: "",
    date: "",
    roster: [],
    presentIds: [],
    rosterLoading: false,
    rosterError: "",
    saving: false,
    notice: "",
    pageError: "",
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
    setBatches(state, batches) {
      return { ...state, batches };
    },
    setBatchesLoading(state, batchesLoading) {
      return { ...state, batchesLoading };
    },
    setModalOpen(state, modalOpen) {
      return { ...state, modalOpen };
    },
    setBatchId(state, batchId) {
      return { ...state, batchId };
    },
    setDate(state, date) {
      return { ...state, date };
    },
    setRoster(state, { roster, presentIds }) {
      return { ...state, roster, presentIds };
    },
    setRosterLoading(state, rosterLoading) {
      return { ...state, rosterLoading };
    },
    setRosterError(state, rosterError) {
      return { ...state, rosterError };
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
    async load({ studentId } = {}) {
      this.setLoading(true);
      this.setError("");
      try {
        const response = await listAttendance(
          studentId ? { studentId } : undefined
        );
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

    async loadBatches() {
      this.setBatchesLoading(true);
      try {
        const response = await listBatches();
        this.setBatches(toCollection(response.data));
      } catch {
        // Why: the register can only be marked when batches are readable.
        this.setBatches([]);
      } finally {
        this.setBatchesLoading(false);
      }
    },

    openForm() {
      this.setModalOpen(true);
      this.setBatchId("");
      this.setDate(today());
      this.setRoster({ roster: [], presentIds: [] });
      this.setRosterError("");
      this.setPageError("");
    },

    closeForm() {
      if (this.saving) return;
      this.setModalOpen(false);
      this.setRosterError("");
    },

    async selectBatch({ batchId }) {
      this.setBatchId(batchId);
      if (batchId && this.date) {
        await this.loadChecklist({ batchId, date: this.date });
      } else {
        this.setRoster({ roster: [], presentIds: [] });
      }
    },

    async selectDate({ date }) {
      this.setDate(date);
      if (this.batchId && date) {
        await this.loadChecklist({ batchId: this.batchId, date });
      } else {
        this.setRoster({ roster: [], presentIds: [] });
      }
    },

    async loadChecklist({ batchId, date } = {}) {
      if (!batchId || !date) return;

      this.setRosterLoading(true);
      this.setRosterError("");
      try {
        const [studentsResponse, recordsResponse] = await Promise.all([
          listBatchStudents(batchId),
          listAttendance({ batchId, date }),
        ]);

        const roster = toCollection(studentsResponse.data);
        const existing = toCollection(recordsResponse.data);
        const presentIds = existing
          .filter(record => record.status === "present")
          .map(studentIdOf)
          .filter(Boolean);

        this.setRoster({ roster, presentIds });
      } catch (error) {
        this.setRosterError(apiError(error));
        this.setRoster({ roster: [], presentIds: [] });
      } finally {
        this.setRosterLoading(false);
      }
    },

    togglePresent({ id }) {
      const present = this.presentIds.some(
        value => String(value) === String(id)
      );
      const presentIds = present
        ? this.presentIds.filter(value => String(value) !== String(id))
        : [...this.presentIds, id];

      this.setRoster({ roster: this.roster, presentIds });
    },

    async save({ studentId } = {}) {
      if (!this.batchId) {
        this.setRosterError("Choose a batch before saving attendance.");
        return false;
      }

      if (!this.roster.length) {
        this.setRosterError("This batch has no students to mark.");
        return false;
      }

      const { batchId, date, roster, presentIds } = this;
      this.setRosterError("");
      this.setSaving(true);

      try {
        await Promise.all(
          roster.map(student => {
            const id = student._id || student.id;
            return markAttendance({
              studentId: id,
              batchId,
              date,
              status: presentIds.some(value => String(value) === String(id))
                ? "present"
                : "absent",
            });
          })
        );

        this.setNotice(`Attendance saved for ${roster.length} students.`);
        this.setModalOpen(false);
        await this.load({ studentId });
        return true;
      } catch (error) {
        this.setRosterError(apiError(error));
        return false;
      } finally {
        this.setSaving(false);
      }
    },
  }),
};
