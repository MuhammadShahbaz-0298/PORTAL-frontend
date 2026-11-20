/* Users model: list, create, lifecycle actions, and one-time credentials held only in memory. */
import { register } from "../../api/auth";
import {
  archiveUser,
  deleteUser,
  exportUsers,
  listUsers,
  resetPassword as resetUserPassword,
  updateUser,
} from "../../api/users";
import { listRoles } from "../../api/roles";
import {
  bulkImportUsers,
  downloadUserImportTemplate,
} from "../../api/bulkImport";
import { apiError } from "../../api/client";
import { listHelper, loadList } from "../../lib/listHelper";

// Why: crypto keeps generated passwords unpredictable and meets the backend
// rule of at least one upper-case, lower-case, digit, and special character.
const PASSWORD_SETS = [
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "abcdefghijklmnopqrstuvwxyz",
  "0123456789",
  "!@#$%^&*",
];
const PASSWORD_ALPHABET = PASSWORD_SETS.join("");

function randomIndex(size) {
  const values = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / size) * size;

  // Why: rejection sampling avoids modulo bias.
  do {
    crypto.getRandomValues(values);
  } while (values[0] >= limit);

  return values[0] % size;
}

export function generatePassword(length = 16) {
  const characters = PASSWORD_SETS.map(set => set[randomIndex(set.length)]);

  while (characters.length < length) {
    characters.push(PASSWORD_ALPHABET[randomIndex(PASSWORD_ALPHABET.length)]);
  }

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapWith = randomIndex(index + 1);
    [characters[index], characters[swapWith]] = [
      characters[swapWith],
      characters[index],
    ];
  }

  return characters.join("");
}

const credentialNotice = credentials => {
  if (!credentials) return "";
  if (credentials.reason === "reset")
    return "Temporary password generated. It will not be shown again.";
  return `${credentials.name || "User"} created. Share the one-time password now.`;
};

export const users = {
  state: {
    items: [],
    total: 0,
    query: "",
    roles: [],
    loading: true,
    error: "",
    pageError: "",
    notice: "",
    formOpen: false,
    formError: "",
    saving: false,
    pendingId: null,
    // Only place a password ever lives in this model; cleared when the modal closes.
    credentials: null,
    importOpen: false,
    importReport: null,
    importError: "",
    importSaving: false,
    templateDownloading: false,
    exportError: "",
    exporting: false,
  },

  reducers: {
    setQuery(state, query) {
      return { ...state, query };
    },
    setLoading(state, loading) {
      return { ...state, loading };
    },
    setError(state, error) {
      return { ...state, error };
    },
    setLoaded(state, { items, total }) {
      return { ...state, items, total };
    },
    setRoles(state, roles) {
      return { ...state, roles };
    },
    setPageError(state, pageError) {
      return { ...state, pageError };
    },
    setNotice(state, notice) {
      return { ...state, notice };
    },
    clearMessages(state) {
      return { ...state, pageError: "", notice: "" };
    },
    openForm(state) {
      return { ...state, formOpen: true, formError: "" };
    },
    closeForm(state) {
      return { ...state, formOpen: false, formError: "" };
    },
    setFormError(state, formError) {
      return { ...state, formError };
    },
    setSaving(state, saving) {
      return { ...state, saving };
    },
    setPendingId(state, pendingId) {
      return { ...state, pendingId };
    },
    setCredentials(state, credentials) {
      return { ...state, credentials };
    },
    closeCredentials(state) {
      return {
        ...state,
        credentials: null,
        notice: credentialNotice(state.credentials) || state.notice,
      };
    },
    clearCredentials(state) {
      return { ...state, credentials: null };
    },
    openImport(state) {
      return { ...state, importOpen: true, importReport: null, importError: "" };
    },
    closeImport(state) {
      return { ...state, importOpen: false, importReport: null, importError: "" };
    },
    setImportReport(state, importReport) {
      return { ...state, importReport, importError: "" };
    },
    setImportError(state, importError) {
      return { ...state, importError };
    },
    setImportSaving(state, importSaving) {
      return { ...state, importSaving };
    },
    setTemplateDownloading(state, templateDownloading) {
      return { ...state, templateDownloading };
    },
    setExportError(state, exportError) {
      return { ...state, exportError };
    },
    setExporting(state, exporting) {
      return { ...state, exporting };
    },
  },

  effects: () => ({
    async load() {
      return loadList(this, listUsers);
    },

    async loadRoles() {
      try {
        const response = await listRoles();
        this.setRoles(listHelper(response).items);
      } catch {
        // Why: the role catalogue is admin-only; core roles still work without it.
        this.setRoles([]);
      }
    },

    async create(form) {
      this.setFormError("");
      this.setSaving(true);
      try {
        // Why: the generated password goes straight to the API and the credentials modal.
        const password = generatePassword();
        const { data } = await register({
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          password,
        });

        this.closeForm();
        this.setCredentials({
          name: data?.name || form.name.trim(),
          email: data?.email || form.email.trim(),
          password,
          reason: "created",
        });
        await this.load();
        return true;
      } catch (error) {
        // Form errors stay inline in the modal; the page Toast never shows them.
        this.setFormError(apiError(error));
        return false;
      } finally {
        this.setSaving(false);
      }
    },

    async bulkImport(file) {
      this.setImportError("");
      this.setImportSaving(true);
      try {
        const { data } = await bulkImportUsers(file);
        const report = Array.isArray(data) ? data : [];
        this.setImportReport(report);
        const succeeded = report.filter(row => row.success).length;
        this.setNotice(`Imported ${succeeded} of ${report.length} rows.`);
        await this.load();
        return true;
      } catch (error) {
        this.setImportError(apiError(error));
        return false;
      } finally {
        this.setImportSaving(false);
      }
    },

    async downloadImportTemplate() {
      this.setImportError("");
      this.setTemplateDownloading(true);
      try {
        const { data } = await downloadUserImportTemplate();
        const url = window.URL.createObjectURL(data);
        const link = document.createElement("a");
        link.href = url;
        link.download = "user-import-template.xlsx";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        return true;
      } catch (error) {
        this.setImportError(
          apiError(error) || "The Excel template could not be downloaded. Try again."
        );
        return false;
      } finally {
        this.setTemplateDownloading(false);
      }
    },

    async exportExcel() {
      this.setExportError("");
      this.setExporting(true);
      try {
        const { data } = await exportUsers();
        const url = window.URL.createObjectURL(
          new Blob([data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = "users.xlsx";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        return true;
      } catch (error) {
        this.setExportError(
          apiError(error) || "The Excel export could not be downloaded. Try again."
        );
        return false;
      } finally {
        this.setExporting(false);
      }
    },

    async setActive({ id, active, name, archived = false }) {
      this.setPendingId(id);
      this.setPageError("");
      try {
        await updateUser(id, { active });
        this.setNotice(
          `${name || "User"} ${active ? (archived ? "restored" : "activated") : "deactivated"}.`
        );
        await this.load();
      } catch (error) {
        this.setPageError(apiError(error));
      } finally {
        this.setPendingId(null);
      }
    },

    async archive({ id, name }) {
      this.setPendingId(id);
      this.setPageError("");
      try {
        await archiveUser(id);
        this.setNotice(`${name || "User"} archived. Their history is kept.`);
        await this.load();
      } catch (error) {
        this.setPageError(apiError(error));
      } finally {
        this.setPendingId(null);
      }
    },

    async remove({ id, name }) {
      this.setPendingId(id);
      this.setPageError("");
      try {
        await deleteUser(id);
        this.setNotice(`${name || "User"} permanently deleted.`);
        await this.load();
      } catch (error) {
        this.setPageError(apiError(error));
      } finally {
        this.setPendingId(null);
      }
    },

    async resetPassword({ id, email, name }) {
      this.setPendingId(id);
      this.setPageError("");
      try {
        const { data } = await resetUserPassword(id);
        this.setCredentials({
          name,
          email,
          password: data?.temporaryPassword || "",
          reason: "reset",
        });
      } catch (error) {
        this.setPageError(apiError(error));
      } finally {
        this.setPendingId(null);
      }
    },
  }),
};
