/* Analytics model. */
import { getAnalyticsOverview, getBatchAnalytics } from "../../api/analytics";
import { apiError } from "../../api/client";

export const analytics = {
  state: {
    overview: null,
    batch: null,
    loading: true,
    error: "",
  },
  reducers: {
    setLoading(state, loading) { return { ...state, loading }; },
    setError(state, error) { return { ...state, error }; },
    setOverview(state, overview) { return { ...state, overview }; },
    setBatch(state, batch) { return { ...state, batch }; },
    clearBatch(state) { return { ...state, batch: null }; },
  },
  effects: () => ({
    async loadOverview() {
      this.setLoading(true);
      this.setError("");
      try {
        const { data } = await getAnalyticsOverview();
        this.setOverview(data);
      } catch (error) {
        this.setError(apiError(error));
      } finally {
        this.setLoading(false);
      }
    },
    async loadBatch(id) {
      this.setBatch(null);
      this.setLoading(true);
      this.setError("");
      try {
        const { data } = await getBatchAnalytics(id);
        this.setBatch(data);
      } catch (error) {
        this.setError(apiError(error));
      } finally {
        this.setLoading(false);
      }
    },
  }),
};