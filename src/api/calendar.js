import client from "./client";

export const downloadCalendarFeed = () =>
  client.get("/calendar.ics", { responseType: "blob" });
