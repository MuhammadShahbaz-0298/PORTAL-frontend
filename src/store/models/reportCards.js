import { getReportCard } from "../../api/reportCard";
import { apiError } from "../../api/client";

export const reportCards = {
  state: {
    downloadingId: "",
    error: "",
  },

  reducers: {
    setDownloadingId(state, downloadingId) {
      return { ...state, downloadingId };
    },
    setError(state, error) {
      return { ...state, error };
    },
    clearError(state) {
      return { ...state, error: "" };
    },
  },

  effects: () => ({
    async download({ userId, batchId }) {
      this.setDownloadingId(userId);
      this.setError("");
      try {
        const response = await getReportCard(userId, batchId);
        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: "application/pdf" })
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = `report-card-${userId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return true;
      } catch (error) {
        this.setError(apiError(error));
        return false;
      } finally {
        this.setDownloadingId("");
      }
    },
  }),
};
