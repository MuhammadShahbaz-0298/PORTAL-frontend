/* Notifications service. */
import client from "./client";
export const listNotifications = params => client.get("/notifications", { params });
export const markNotificationRead = id => client.patch(`/notifications/${id}/read`);
export const clearAllNotifications = () => client.delete("/notifications");