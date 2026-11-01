/* Roles model: list, create, and update roles with grouped permissions. */
import {
  createRole,
  deleteRole,
  getPermissionCatalog,
  listRoles,
  updateRole,
} from "../../api/roles";
import { apiError } from "../../api/client";
import { toCollection } from "../../lib/apiData";
import { listHelper } from "../../lib/listHelper";

export const roles = {
  state: {
    items: [],
    total: 0,
    loading: true,
    error: "",
    query: "",
    catalog: [],
    catalogLoading: false,
    pendingId: null,
    formOpen: false,
    editing: null,
    formError: "",
    saving: false,
    notice: "",
    pageError: "",
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
    setCatalog(state, catalog) {
      return { ...state, catalog };
    },
    setCatalogLoading(state, catalogLoading) {
      return { ...state, catalogLoading };
    },
    setPendingId(state, pendingId) {
      return { ...state, pendingId };
    },
    openForm(state, editing = null) {
      return { ...state, formOpen: true, editing, formError: "" };
    },
    closeForm(state) {
      return { ...state, formOpen: false, editing: null, formError: "" };
    },
    setFormError(state, formError) {
      return { ...state, formError };
    },
    setSaving(state, saving) {
      return { ...state, saving };
    },
    setNotice(state, notice) {
      return { ...state, notice };
    },
    setPageError(state, pageError) {
      return { ...state, pageError };
    },
    clearMessages(state) {
      return { ...state, notice: "", pageError: "" };
    },
  },

  effects: () => ({
    async load() {
      this.setLoading(true);
      this.setError("");
      try {
        const response = await listRoles();
        const raw = response.data?.roles || response.data;
        const items = toCollection(raw);
        const { total } = listHelper({
          data: items,
          headers: response.headers,
        });
        this.setLoaded({ items, total: total || items.length });
        return items;
      } catch (error) {
        this.setError(apiError(error));
        return [];
      } finally {
        this.setLoading(false);
      }
    },

    async loadCatalog() {
      this.setCatalogLoading(true);
      try {
        const response = await getPermissionCatalog();
        const data = response.data;
        const catalog = Array.isArray(data) ? data : data?.permissions || [];
        this.setCatalog(catalog);
        return catalog;
      } catch {
        this.setCatalog([]);
        return [];
      } finally {
        this.setCatalogLoading(false);
      }
    },

    async save({ id, values }) {
      this.setFormError("");
      this.setSaving(true);

      try {
        if (id) {
          await updateRole(id, {
            label: values.label,
            permissions: values.permissions,
            active: true,
          });
          this.setNotice("Role permissions updated successfully.");
        } else {
          await createRole({
            name: values.name,
            label: values.label || values.name,
            permissions: values.permissions,
          });
          this.setNotice("Role created successfully.");
        }

        this.closeForm();
        await this.load();
        return true;
      } catch (error) {
        this.setFormError(apiError(error));
        return false;
      } finally {
        this.setSaving(false);
      }
    },

    async remove({ id, name }) {
      this.setPendingId(id);
      this.setPageError("");
      try {
        await deleteRole(id);
        this.setNotice(`${name || "Role"} was permanently deleted.`);
        await this.load();
      } catch (error) {
        this.setPageError(apiError(error));
      } finally {
        this.setPendingId(null);
      }
    },
  }),
};
