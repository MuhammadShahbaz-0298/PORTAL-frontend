/* Weighted grades model: one read of the backend-computed score for a student. */
import { getWeightedGrade } from "../../api/weightedGrades";
import { apiError } from "../../api/client";

export const weightedGrades = {
  state: {
    key: "",
    data: null,
    loading: false,
    error: "",
  },

  reducers: {
    setLoading(state, loading) {
      return { ...state, loading, error: "" };
    },
    setData(state, { key, data }) {
      return { ...state, key, data, loading: false };
    },
    setError(state, error) {
      return { ...state, error, loading: false };
    },
  },

  effects: () => ({
    async load({ studentId, batchId }) {
      const key = `${studentId}:${batchId}`;
      this.setLoading(true);
      try {
        const { data } = await getWeightedGrade(studentId, batchId);
        this.setData({ key, data });
        return true;
      } catch (error) {
        this.setError(apiError(error));
        return false;
      }
    },
  }),
};
