/* Global search service. */
import client from "./client";
export const globalSearch = params => client.get("/search", { params });