/* Bulk Excel import service. */
import client from "./client";

export const bulkImportUsers = file => {
  const data = new FormData();
  data.append("file", file);
  return client.post("/users/bulk-import", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const downloadUserImportTemplate = () =>
  client.get("/users/bulk-import/template", { responseType: "blob" });
