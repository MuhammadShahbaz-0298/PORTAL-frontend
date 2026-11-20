import { downloadCalendarFeed } from "../../api/calendar";
import { apiError } from "../../api/client";

export const calendar = {
  state: {
    downloading: false,
    error: "",
  },

  reducers: {
    setDownloading(state, downloading) {
      return { ...state, downloading };
    },
    setError(state, error) {
      return { ...state, error };
    },
    clearError(state) {
      return { ...state, error: "" };
    },
  },

  effects: () => ({
    async download() {
      this.setError("");
      this.setDownloading(true);
      try {
        const { data } = await downloadCalendarFeed();
        const url = window.URL.createObjectURL(
          new Blob([data], { type: "text/calendar" })
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = "calendar.ics";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return true;
      } catch (error) {
        this.setError(
          apiError(error) || "The calendar could not be downloaded. Try again."
        );
        return false;
      } finally {
        this.setDownloading(false);
      }
    },
  }),
};
