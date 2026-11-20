/* Analytics service. */
import client from "./client";
export const getAnalyticsOverview = () => client.get("/analytics/overview");
export const getBatchAnalytics = id => client.get(`/analytics/batch/${id}`);