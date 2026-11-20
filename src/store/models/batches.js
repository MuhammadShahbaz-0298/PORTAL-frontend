/* Batches model: cohort cards, create/edit, archive, and enrollment. */
import {
  createBatch,
  archiveBatch,
  deleteBatch,
  enrollStudent,
  unenrollStudent,
  listEligibleBatchStudents,
  listBatchStudents,
  listBatches,
  updateBatch,
} from "../../api/batches";
import { listUsers } from "../../api/users";
import { apiError } from "../../api/client";
import { toCollection } from "../../lib/apiData";
import { loadList } from "../../lib/listHelper";

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
    eligibleStudents: [],
    peopleLoading: false,
    formOpen: false,
    editing: null,
    formError: "",
    saving: false,
    enrollOpen: false,
    enrollBatch: null,
    enrolled: [],
    enrolledLoading: false,
    eligibleLoading: false,
    enrollError: "",
    enrollNotice: "",
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
    setEligibleStudents(state, eligibleStudents) {
      return { ...state, eligibleStudents };
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
    setEligibleLoading(state, eligibleLoading) {
      return { ...state, eligibleLoading };
    },
    setEnrollError(state, enrollError) {
      return { ...state, enrollError };
    },
    setEnrollNotice(state, enrollNotice) {
      return { ...state, enrollNotice };
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
      return loadList(this, listBatches);
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
      this.setEnrollNotice("");
      this.setEnrolled([]);
      this.setEligibleStudents([]);
      this.setEnrolledLoading(true);
      this.setEligibleLoading(true);

      try {
        const [enrolledResponse, eligibleResponse] = await Promise.all([
          listBatchStudents(idOf(batch)),
          listEligibleBatchStudents(idOf(batch)),
        ]);
        this.setEnrolled(toCollection(enrolledResponse.data));
        this.setEligibleStudents(toCollection(eligibleResponse.data));
      } catch (error) {
        this.setEnrollError(apiError(error));
      } finally {
        this.setEnrolledLoading(false);
        this.setEligibleLoading(false);
      }
    },

    closeEnroll(_payload, rootState) {
      if (rootState?.batches?.enrolling || rootState?.batches?.pendingId)
        return;
      this.setEnrollOpen(false);
      this.setEnrollBatch(null);
      this.setEnrolled([]);
      this.setEligibleStudents([]);
      this.setEnrollError("");
      this.setEnrollNotice("");
    },

    async enroll({ studentId }, rootState) {
      if (!studentId) {
        this.setEnrollError("Choose a student before enrolling.");
        return false;
      }

      const batchId = idOf(rootState?.batches?.enrollBatch);
      if (!batchId) {
        this.setEnrollError("Choose a batch before enrolling.");
        return false;
      }

      this.setEnrollError("");
      this.setEnrollNotice("");
      this.setEnrolling(true);

      try {
        await enrollStudent(batchId, studentId);
        const { enrolled = [], eligibleStudents = [] } =
          rootState.batches || {};
        const student = eligibleStudents.find(
          item => String(idOf(item)) === String(studentId)
        );
        if (student) this.setEnrolled([...enrolled, student]);
        this.setEligibleStudents(
          eligibleStudents.filter(
            item => String(idOf(item)) !== String(studentId)
          )
        );
        this.setEnrollNotice("Student enrolled successfully.");
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

    async removeStudent({ studentId }, rootState) {
      const batch = rootState?.batches?.enrollBatch;
      const batchId = idOf(batch);
      if (!batchId || !studentId) {
        this.setEnrollError(
          "Choose a student and batch before removing enrollment."
        );
        return false;
      }

      this.setEnrollError("");
      this.setEnrollNotice("");
      this.setPendingId(studentId);
      try {
        await unenrollStudent(batchId, studentId);
        const { enrolled = [], eligibleStudents = [] } =
          rootState.batches || {};
        const removedStudent = enrolled.find(
          item => String(idOf(item)) === String(studentId)
        );
        this.setEnrolled(
          enrolled.filter(item => String(idOf(item)) !== String(studentId))
        );
        if (removedStudent) {
          this.setEligibleStudents([...eligibleStudents, removedStudent]);
        }
        this.setEnrollNotice("Student removed from this batch.");
        this.setNotice("Student removed from this batch.");
        await this.load();
        return true;
      } catch (error) {
        this.setEnrollError(apiError(error));
        return false;
      } finally {
        this.setPendingId(null);
      }
    },
  }),
};
