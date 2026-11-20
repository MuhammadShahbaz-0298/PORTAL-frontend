/* Submissions model: the inbox, student upload, and file downloads. */
import {
  downloadSubmission,
  exportSubmissions,
  listSubmissionVersions,
  listSubmissions,
  saveSubmissionFile,
} from "../../api/submissions";
import { listAssignments } from "../../api/assignments";
import { apiError } from "../../api/client";
import { toCollection } from "../../lib/apiData";
import { loadList } from "../../lib/listHelper";
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
    exportError: "",
    exporting: false,
    versions: [],
    versionsSubmissionId: null,
    versionsLoading: false,
    versionsError: "",
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
    setExporting(state, exporting) {
      return { ...state, exporting };
    },
    setExportError(state, exportError) {
      return { ...state, exportError };
    },
    setVersions(state, { submissionId, items }) {
      return { ...state, versionsSubmissionId: submissionId, versions: items };
    },
    setVersionsLoading(state, versionsLoading) {
      return { ...state, versionsLoading };
    },
    setVersionsError(state, versionsError) {
      return { ...state, versionsError };
    },
  },

  effects: () => ({
    async load() {
      return loadList(this, () => listSubmissions());
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

    async exportExcel() {
      this.setExportError("");
      this.setExporting(true);
      try {
        const { data } = await exportSubmissions();
        const url = window.URL.createObjectURL(
          new Blob([data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = "submissions.xlsx";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        return true;
      } catch (error) {
        this.setExportError(
          apiError(error) || "The Excel export could not be downloaded. Try again."
        );
        return false;
      } finally {
        this.setExporting(false);
      }
    },

    async loadVersions(submissionId) {
      if (!submissionId) {
        this.setVersions({ submissionId: null, items: [] });
        this.setVersionsError("");
        return;
      }

      this.setVersions({ submissionId, items: [] });
      this.setVersionsError("");
      this.setVersionsLoading(true);
      try {
        const { data } = await listSubmissionVersions(submissionId);
        this.setVersions({
          submissionId,
          items: Array.isArray(data) ? data : data?.items || [],
        });
      } catch (error) {
        this.setVersionsError(apiError(error));
      } finally {
        this.setVersionsLoading(false);
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
