/* Assignment resources model: the only place that calls the resource API. */
import {
  archiveAssignmentResource,
  downloadAssignmentResource,
  listAssignmentResources,
  uploadAssignmentResource,
} from "../../api/assignmentResources";
import { apiError } from "../../api/client";
import { toCollection } from "../../lib/apiData";

const initialState = {
  items: [],
  loading: false,
  error: "",
  uploading: false,
  uploadError: "",
  archivingId: "",
};

export const assignmentResources = {
  state: initialState,

  reducers: {
    setLoading(state, loading) {
      return { ...state, loading };
    },
    setError(state, error) {
      return { ...state, error };
    },
    setItems(state, items) {
      return { ...state, items };
    },
    setUploading(state, uploading) {
      return { ...state, uploading };
    },
    setUploadError(state, uploadError) {
      return { ...state, uploadError };
    },
    setArchivingId(state, archivingId) {
      return { ...state, archivingId };
    },
    reset(state) {
      return { ...state, ...initialState };
    },
  },

  effects: () => ({
    async load({ assignmentId }) {
      this.setLoading(true);
      this.setError("");
      try {
        const { data } = await listAssignmentResources(assignmentId);
        this.setItems(toCollection(data));
      } catch (error) {
        this.setItems([]);
        this.setError(apiError(error));
      } finally {
        this.setLoading(false);
      }
    },

    async upload({ assignmentId, file }) {
      this.setUploading(true);
      this.setUploadError("");
      try {
        await uploadAssignmentResource(assignmentId, file);
        await this.load({ assignmentId });
        return true;
      } catch (error) {
        this.setUploadError(apiError(error));
        return false;
      } finally {
        this.setUploading(false);
      }
    },

    async download({ assignmentId, resourceId, fileName }) {
      this.setError("");
      try {
        const { data } = await downloadAssignmentResource(assignmentId, resourceId);
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return true;
      } catch (error) {
        this.setError(apiError(error));
        return false;
      }
    },

    async archive({ assignmentId, resourceId }) {
      this.setArchivingId(resourceId);
      this.setError("");
      try {
        await archiveAssignmentResource(assignmentId, resourceId);
        await this.load({ assignmentId });
        return true;
      } catch (error) {
        this.setError(apiError(error));
        return false;
      } finally {
        this.setArchivingId("");
      }
    },
  }),
};
