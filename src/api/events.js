import client from "./client";

export const listEvents = params => client.get("/events", { params });

export const createEvent = payload => client.post("/events", payload);

export const updateEvent = (id, payload) => client.patch(`/events/${id}`, payload);

export const archiveEvent = id => client.patch(`/events/${id}/archive`);
