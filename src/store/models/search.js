import { globalSearch } from "../../api/search";

export const search = {
  state: {
    results: null,
    loading: false,
    error: "",
  },

  reducers: {
    setResults(state, results) {
      return { ...state, results };
    },
    setLoading(state, loading) {
      return { ...state, loading };
    },
    setError(state, error) {
      return { ...state, error };
    },
    clear(state) {
      return { ...state, results: null, loading: false, error: "" };
    },
  },

  effects: () => ({
    async run(query) {
      this.setLoading(true);
      this.setError("");
      try {
        const { data } = await globalSearch({ q: query });
        this.setResults(data);
        return true;
      } catch {
        this.setResults(null);
        this.setError("Search is unavailable. Try again.");
        return false;
      } finally {
        this.setLoading(false);
      }
    },
  }),
};
