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
    leaves: {},
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
    setRoster(state, { roster, presentIds, leaves }) {
      return { ...state, roster, presentIds, leaves: leaves || {} };
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
      this.setRoster({ roster: [], presentIds: [], leaves: {} });
      this.setRosterError("");
      this.setPageError("");
    },

    closeForm(_, rootState) {
      if (rootState?.attendance?.saving) return;
      this.setModalOpen(false);
      this.setRosterError("");
    },

    async selectBatch({ batchId }, rootState) {
      this.setBatchId(batchId);
      const attendance = rootState?.attendance || {};
      if (batchId && attendance.date) {
        await this.loadChecklist({ batchId, date: attendance.date });
      } else {
        this.setRoster({ roster: [], presentIds: [], leaves: {} });
      }
    },

    async selectDate({ date }, rootState) {
      this.setDate(date);
      const attendance = rootState?.attendance || {};
      if (attendance.batchId && date) {
        await this.loadChecklist({ batchId: attendance.batchId, date });
      } else {
        this.setRoster({ roster: [], presentIds: [], leaves: {} });
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

        const leaves = {};
        existing.forEach(record => {
          if (record.status === "leave") {
            leaves[studentIdOf(record)] = record.leaveReason || "";
          }
        });

        this.setRoster({ roster, presentIds, leaves });
      } catch (error) {
        this.setRosterError(apiError(error));
        this.setRoster({ roster: [], presentIds: [], leaves: {} });
      } finally {
        this.setRosterLoading(false);
      }
    },

    togglePresent({ id, leave, reason }, rootState) {
      const attendance = rootState?.attendance || {};
      const presentIds = attendance.presentIds || [];
      const leaves = { ...(attendance.leaves || {}) };
      const roster = attendance.roster || [];
      let updatedPresentIds = presentIds;

      if (reason !== undefined) {
        leaves[id] = reason;
      } else if (leave === true) {
        if (leaves[id] !== undefined) {
          delete leaves[id];
        } else {
          leaves[id] = "";
          updatedPresentIds = presentIds.filter(
            value => String(value) !== String(id)
          );
        }
      } else {
        const alreadyPresent = presentIds.some(
          value => String(value) === String(id)
        );
        updatedPresentIds = alreadyPresent
          ? presentIds.filter(value => String(value) !== String(id))
          : [...presentIds, id];
        delete leaves[id];
      }

      this.setRoster({ roster, presentIds: updatedPresentIds, leaves });
    },

    async save({ studentId } = {}, rootState) {
      const attendance = rootState?.attendance || {};
      const leaves = attendance.leaves || {};
      const presentIds = attendance.presentIds || [];
      const roster = attendance.roster || [];

      if (!attendance.batchId) {
        this.setRosterError("Choose a batch before saving attendance.");
        return false;
      }

      if (!roster.length) {
        this.setRosterError("This batch has no students to mark.");
        return false;
      }

      const hasMissingReason = Object.values(leaves).some(
        reason => typeof reason !== "string" || !reason.trim()
      );
      if (hasMissingReason) {
        this.setRosterError("Add a reason for every student on leave.");
        return false;
      }

      this.setRosterError("");
      this.setSaving(true);

      try {
        await Promise.all(
          roster.map(student => {
            const id = student._id || student.id;
            const isOnLeave = leaves[id] !== undefined;
            const isPresent = presentIds.some(
              value => String(value) === String(id)
            );
            let status = "absent";
            if (isOnLeave) {
              status = "leave";
            } else if (isPresent) {
              status = "present";
            }

            const record = {
              studentId: id,
              batchId: attendance.batchId,
              date: attendance.date,
              status,
            };
            if (isOnLeave) record.leaveReason = leaves[id];
            return markAttendance(record);
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
