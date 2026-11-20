/* useDashboardAnalyticsSelection: load and select admin/staff analytics.
 * Stale batch results are hidden until the selected batch matches.
 */
import { useEffect, useState } from "react";

export function useDashboardAnalyticsSelection({
  enabled,
  analytics,
  loadOverview,
  loadBatch,
  clearBatch,
  loadBatches,
}) {
  const [selectedBatch, setSelectedBatch] = useState("");

  useEffect(() => {
    if (!enabled) return;
    loadOverview();
    loadBatches();
  }, [enabled, loadOverview, loadBatches]);

  useEffect(() => {
    if (!enabled) return;
    if (!selectedBatch) {
      clearBatch();
      return;
    }
    loadBatch(selectedBatch);
  }, [enabled, selectedBatch, loadBatch, clearBatch]);

  const selectedBatchAnalytics =
    analytics.batch && String(analytics.batch.batchId) === String(selectedBatch)
      ? analytics.batch
      : null;

  return { selectedBatch, setSelectedBatch, selectedBatchAnalytics };
}
