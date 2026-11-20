/* Announcements service. */
import client from "./client";
export const listAnnouncements = params => client.get("/announcements", { params });
export const createAnnouncement = payload => client.post("/announcements", payload);
export const updateAnnouncement = (id, payload) => client.patch(`/announcements/${id}`, payload);
export const archiveAnnouncement = id => client.patch(`/announcements/${id}/archive`);