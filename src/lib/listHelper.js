/* listHelper: one place that normalises list responses and filters rows. */
import { apiError } from "../api/client";
import { toCollection } from "./apiData";

export function listHelper(response) {
  const items = toCollection(response?.data);
  const total = Number(response?.headers?.["x-total-count"]);

  return {
    items,
    total: Number.isFinite(total) ? total : items.length,
  };
}

/* One quiet read: no loading flag and no error state. */
export async function readList(fetchList) {
  const response = await fetchList();
  const { items, total } = listHelper(response);
  return { items, total };
}

/* One list load for a model: loading flag, rows, and a readable error. */
export async function loadList(model, fetchList) {
  model.setLoading(true);
  model.setError("");
  try {
    const { items, total } = await readList(fetchList);
    model.setLoaded({ items, total });
    return items;
  } catch (error) {
    model.setError(apiError(error));
    return [];
  } finally {
    model.setLoading(false);
  }
}

export function filterItems(items = [], query = "", fields = []) {
  const needle = query.trim().toLowerCase();
  if (!needle) return items;

  return items.filter(item =>
    fields.some(field =>
      String(item?.[field] ?? "")
        .toLowerCase()
        .includes(needle)
    )
  );
}
