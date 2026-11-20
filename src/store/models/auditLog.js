/* Audit log model. */
import { listAuditLogs } from "../../api/auditLog";
import { loadList } from "../../lib/listHelper";

export const auditLog = {
  state: {
    items: [],
    total: 0,
    query: "",
    loading: true,
    error: "",
  },
  reducers: {
    setQuery(state, query) { return { ...state, query }; },
    setLoading(state, loading) { return { ...state, loading }; },
    setError(state, error) { return { ...state, error }; },
    setLoaded(state, { items, total }) { return { ...state, items, total }; },
  },
  effects: () => ({
    async load() { return loadList(this, listAuditLogs); },
  }),
};