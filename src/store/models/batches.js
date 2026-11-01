/* Batches model: cohort cards, create/edit, archive, and enrollment. */
import {
  createBatch,
  archiveBatch,
  deleteBatch,
  enrollStudent,
  listBatchStudents,
  listBatches,
  updateBatch,
} from "../../api/batches";
import { listUsers } from "../../api/users";
import { apiError } from "../../api/client";
import { toCollection } from "../../lib/apiData";
import { listHelper } from "../../lib/listHelper";

const idOf = value => value?._id || value?.id;

export const batches = {
  state: {
    items: [],
    total: 0,
    loading: true,
    error: "",
    query: "",
    teachers: [],
    students: [],
    peopleLoading: false,
    formOpen: false,
    editing: null,
    formError: "",
    saving: false,
    enrollOpen: false,
    enrollBatch: null,
    enrolled: [],
    enrolledLoading: false,
    enrollError: "",
    enrolling: false,
    pendingId: null,
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
    setTeachers(state, teachers) {
      return { ...state, teachers };
    },
    setStudents(state, students) {
      return { ...state, students };
    },
    setPeopleLoading(state, peopleLoading) {
      return { ...state, peopleLoading };
    },
    setFormOpen(state, formOpen) {
      return { ...state, formOpen };
    },
    setEditing(state, editing) {
      return { ...state, editing };
    },
    setFormError(state, formError) {
      return { ...state, formError };
    },
    setSaving(state, saving) {
      return { ...state, saving };
    },
    setEnrollOpen(state, enrollOpen) {
      return { ...state, enrollOpen };
    },
    setEnrollBatch(state, enrollBatch) {
      return { ...state, enrollBatch };
    },
    setEnrolled(state, enrolled) {
      return { ...state, enrolled };
    },
    setEnrolledLoading(state, enrolledLoading) {
      return { ...state, enrolledLoading };
    },
    setEnrollError(state, enrollError) {
      return { ...state, enrollError };
    },
    setEnrolling(state, enrolling) {
      return { ...state, enrolling };
    },
    setPendingId(state, pendingId) {
      return { ...state, pendingId };
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
        const response = await listBatches();
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

    async loadPeople() {
      this.setPeopleLoading(true);
      try {
        const [teachersResponse, studentsResponse] = await Promise.all([
          listUsers({ role: "teacher" }),
          listUsers({ role: "student" }),
        ]);

        this.setTeachers(toCollection(teachersResponse.data));
        this.setStudents(toCollection(studentsResponse.data));
      } catch {
        // Why: a teacher may only see learners in their own batches; the
        // existing records still render and only the pickers are reduced.
        this.setTeachers([]);
        this.setStudents([]);
      } finally {
        this.setPeopleLoading(false);
      }
    },

    openForm({ batch = null } = {}) {
      this.setEditing(batch);
      this.setFormOpen(true);
      this.setFormError("");
      this.setPageError("");
    },

    closeForm() {
      if (this.saving) return;
      this.setFormOpen(false);
      this.setEditing(null);
      this.setFormError("");
    },

    async save({ values }) {
      this.setFormError("");
      this.setSaving(true);

      try {
        if (idOf(this.editing)) {
          await updateBatch(idOf(this.editing), values);
          this.setNotice("Batch updated successfully.");
        } else {
          await createBatch(values);
          this.setNotice("Batch created successfully.");
        }

        this.setFormOpen(false);
        this.setEditing(null);
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
      this.setPendingId(id);
      this.setPageError("");
      try {
        await archiveBatch(id);
        this.setNotice(
          "Batch archived. Existing enrollments and history are kept."
        );
        await this.load();
      } catch (error) {
        this.setPageError(apiError(error));
      } finally {
        this.setPendingId(null);
      }
    },

    async remove({ id }) {
      this.setPendingId(id);
      this.setPageError("");
      try {
        await deleteBatch(id);
        this.setNotice("Batch permanently deleted.");
        await this.load();
      } catch (error) {
        this.setPageError(apiError(error));
      } finally {
        this.setPendingId(null);
      }
    },

    async openEnroll({ batch }) {
      this.setEnrollBatch(batch);
      this.setEnrollOpen(true);
      this.setEnrollError("");
      this.setEnrolled([]);
      this.setEnrolledLoading(true);

      try {
        const response = await listBatchStudents(idOf(batch));
        this.setEnrolled(toCollection(response.data));
      } catch (error) {
        this.setEnrollError(apiError(error));
      } finally {
        this.setEnrolledLoading(false);
      }
    },

    closeEnroll() {
      if (this.enrolling) return;
      this.setEnrollOpen(false);
      this.setEnrollBatch(null);
      this.setEnrolled([]);
      this.setEnrollError("");
    },

    async enroll({ studentId }) {
      if (!studentId) {
        this.setEnrollError("Choose a student before enrolling.");
        return false;
      }

      const batchId = idOf(this.enrollBatch);
      if (!batchId) return false;

      this.setEnrollError("");
      this.setEnrolling(true);

      try {
        await enrollStudent(batchId, studentId);
        const response = await listBatchStudents(batchId);
        this.setEnrolled(toCollection(response.data));
        this.setNotice("Student enrolled successfully.");
        await this.load();
        return true;
      } catch (error) {
        this.setEnrollError(apiError(error));
        return false;
      } finally {
        this.setEnrolling(false);
      }
    },
  }),
};
