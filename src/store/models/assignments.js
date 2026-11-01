/* Assignments model: list, create/edit, archive, and the student brief detail. */
import {
  archiveAssignment,
  createAssignment,
  getAssignment,
  listAssignments,
  updateAssignment,
} from "../../api/assignments";
import { listBatches } from "../../api/batches";
import { listSubmissions, saveSubmissionFile } from "../../api/submissions";
import { apiError } from "../../api/client";
import { toCollection } from "../../lib/apiData";
import { listHelper } from "../../lib/listHelper";
import { getProgressPercentage } from "../../lib/transferProgress";

const ASSIGNMENT_DEFAULTS = {
  allowedFileTypes: ["zip"],
  maxFileSizeMb: 50,
  resubmissionPolicy: "disabled",
};

export const assignments = {
  state: {
    items: [],
    total: 0,
    loading: true,
    error: "",
    query: "",
    batches: [],
    formOpen: false,
    editing: null,
    formError: "",
    saving: false,
    pendingId: null,
    notice: "",
    pageError: "",
    detail: null,
    detailLoading: false,
    detailError: "",
    submission: null,
    submissionNotice: "",
    submissionError: "",
    uploading: false,
    uploadProgress: null,
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
    openForm(state, assignment = null) {
      return { ...state, formOpen: true, editing: assignment, formError: "" };
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
    setDetail(state, detail) {
      return { ...state, detail };
    },
    setDetailLoading(state, detailLoading) {
      return { ...state, detailLoading };
    },
    setDetailError(state, detailError) {
      return { ...state, detailError };
    },
    setSubmission(state, submission) {
      return { ...state, submission };
    },
    setSubmissionNotice(state, submissionNotice) {
      return { ...state, submissionNotice };
    },
    setSubmissionError(state, submissionError) {
      return { ...state, submissionError };
    },
    setUploading(state, uploading) {
      return { ...state, uploading };
    },
    setUploadProgress(state, uploadProgress) {
      return { ...state, uploadProgress };
    },
    clearDetailMessages(state) {
      return { ...state, submissionNotice: "", submissionError: "" };
    },
    resetDetail(state) {
      return {
        ...state,
        detail: null,
        detailLoading: false,
        detailError: "",
        submission: null,
        submissionNotice: "",
        submissionError: "",
        uploading: false,
        uploadProgress: null,
      };
    },
  },

  effects: () => ({
    async load() {
      this.setLoading(true);
      this.setError("");
      try {
        const response = await listAssignments();
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
      try {
        const response = await listBatches();
        this.setBatches(toCollection(response.data));
      } catch {
        // Why: the batch catalogue is optional for the assignment form.
        this.setBatches([]);
      }
    },

    async save({ id, values }) {
      this.setFormError("");
      this.setSaving(true);

      try {
        const payload = {
          ...values,
          ...ASSIGNMENT_DEFAULTS,
          active: true,
        };

        if (id) {
          await updateAssignment(id, payload);
          this.setNotice("Assignment updated successfully.");
        } else {
          await createAssignment(payload);
          this.setNotice("Assignment created successfully.");
        }

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
      this.setPendingId(id);
      this.setPageError("");
      try {
        await archiveAssignment(id);
        this.setNotice(
          "Assignment archived. New submissions are no longer accepted."
        );
        await this.load();
      } catch (error) {
        this.setPageError(apiError(error));
      } finally {
        this.setPendingId(null);
      }
    },

    async loadDetail({ id, student }) {
      this.resetDetail();
      this.setDetailLoading(true);
      this.setDetailError("");

      try {
        const assignmentResponse = await getAssignment(id);
        const assignment = assignmentResponse.data;

        let submission = null;
        if (student) {
          const submissionResponse = await listSubmissions({
            assignmentId: id,
          });
          submission = toCollection(submissionResponse.data)[0] || null;
        }

        this.setDetail(assignment);
        this.setSubmission(submission);
        return assignment;
      } catch (error) {
        this.setDetailError(apiError(error));
        return null;
      } finally {
        this.setDetailLoading(false);
      }
    },

    async upload({ assignmentId, submissionId, file }) {
      this.setSubmissionError("");
      this.setSubmissionNotice("");
      this.setUploading(true);
      this.setUploadProgress(0);

      try {
        const { data } = await saveSubmissionFile({
          assignmentId,
          submissionId,
          file,
          onUploadProgress: event =>
            this.setUploadProgress(getProgressPercentage(event)),
        });

        this.setSubmission(data);
        this.setSubmissionNotice(
          submissionId
            ? "Submission updated. Your previous file was replaced."
            : "Submission uploaded. You can replace it before the deadline."
        );
        return true;
      } catch (error) {
        this.setSubmissionError(apiError(error));
        return false;
      } finally {
        this.setUploading(false);
        this.setUploadProgress(null);
      }
    },
  }),
};
