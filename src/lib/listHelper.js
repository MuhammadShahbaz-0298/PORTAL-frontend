/* listHelper: one place that normalises list responses and filters rows. */
import { toCollection } from "./apiData";

export function listHelper(response) {
  const items = toCollection(response?.data);
  const total = Number(response?.headers?.["x-total-count"]);

  return {
    items,
    total: Number.isFinite(total) ? total : items.length,
  };
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
