/* Dashboard model: one read of the counts and queues the landing page needs. */
import { listAssignments } from "../../api/assignments";
import { listSubmissions } from "../../api/submissions";
import { listBatches } from "../../api/batches";
import { apiError } from "../../api/client";
import { toCollection } from "../../lib/apiData";

const isStaff = role => role === "admin" || role === "teacher";

export const dashboard = {
  state: {
    assignments: [],
    submissions: [],
    batches: [],
    loading: true,
    error: "",
  },

  reducers: {
    setLoading(state, loading) {
      return { ...state, loading };
    },
    setError(state, error) {
      return { ...state, error };
    },
    setData(state, { assignments, submissions, batches }) {
      return { ...state, assignments, submissions, batches };
    },
  },

  effects: () => ({
    async load({ role } = {}) {
      this.setLoading(true);
      this.setError("");

      try {
        const [assignments, submissions, batches] = await Promise.all([
          listAssignments(),
          listSubmissions(),
          // Why: students cannot read the batch catalogue.
          isStaff(role) ? listBatches() : Promise.resolve({ data: [] }),
        ]);

        this.setData({
          assignments: toCollection(assignments.data),
          submissions: toCollection(submissions.data),
          batches: toCollection(batches.data),
        });
        return true;
      } catch (error) {
        this.setError(apiError(error));
        return false;
      } finally {
        this.setLoading(false);
      }
    },
  }),
};
