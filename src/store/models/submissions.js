/* Submissions model: the inbox, student upload, and file downloads. */
import {
  downloadSubmission,
  listSubmissions,
  saveSubmissionFile,
} from "../../api/submissions";
import { listAssignments } from "../../api/assignments";
import { apiError } from "../../api/client";
import { toCollection } from "../../lib/apiData";
import { listHelper } from "../../lib/listHelper";
import { getProgressPercentage } from "../../lib/transferProgress";

export const submissions = {
  state: {
    items: [],
    total: 0,
    loading: true,
    error: "",
    query: "",
    assignments: [],
    assignmentsLoading: false,
    uploadOpen: false,
    formError: "",
    uploading: false,
    uploadProgress: null,
    downloadingId: null,
    downloadProgress: null,
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
    setAssignments(state, assignments) {
      return { ...state, assignments };
    },
    setAssignmentsLoading(state, assignmentsLoading) {
      return { ...state, assignmentsLoading };
    },
    openUpload(state) {
      return { ...state, uploadOpen: true, formError: "" };
    },
    closeUpload(state) {
      return {
        ...state,
        uploadOpen: false,
        formError: "",
        uploadProgress: null,
      };
    },
    setFormError(state, formError) {
      return { ...state, formError };
    },
    setUploading(state, uploading) {
      return { ...state, uploading };
    },
    setUploadProgress(state, uploadProgress) {
      return { ...state, uploadProgress };
    },
    setDownloadingId(state, downloadingId) {
      return { ...state, downloadingId };
    },
    setDownloadProgress(state, downloadProgress) {
      return { ...state, downloadProgress };
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
        const response = await listSubmissions();
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

    async loadAssignments() {
      this.setAssignmentsLoading(true);
      try {
        const response = await listAssignments();
        this.setAssignments(toCollection(response.data));
      } catch {
        // Why: the upload form can still explain that no assignments are open.
        this.setAssignments([]);
      } finally {
        this.setAssignmentsLoading(false);
      }
    },

    async upload({ assignmentId, submissionId, file }) {
      this.setFormError("");
      this.setUploading(true);
      this.setUploadProgress(0);

      try {
        await saveSubmissionFile({
          assignmentId,
          submissionId,
          file,
          onUploadProgress: event =>
            this.setUploadProgress(getProgressPercentage(event)),
        });

        this.closeUpload();
        this.setNotice(
          submissionId
            ? "Submission updated successfully."
            : "Submission uploaded successfully."
        );
        await this.load();
        return true;
      } catch (error) {
        this.setFormError(apiError(error));
        return false;
      } finally {
        this.setUploading(false);
        this.setUploadProgress(null);
      }
    },

    async download({ id, fileName }) {
      this.setPageError("");
      this.setDownloadingId(id);
      this.setDownloadProgress(0);

      try {
        const response = await downloadSubmission(id, event =>
          this.setDownloadProgress(getProgressPercentage(event))
        );
        const url = URL.createObjectURL(response.data);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = fileName || "submission.zip";
        anchor.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        return true;
      } catch (error) {
        this.setPageError(apiError(error) || "Unable to download submission.");
        return false;
      } finally {
        this.setDownloadingId(null);
        this.setDownloadProgress(null);
      }
    },
  }),
};
