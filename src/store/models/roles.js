/* Roles model: list, create, and update roles with grouped permissions. */
import { createRole, deleteRole, listRoles, updateRole } from "../../api/roles";
import { apiError } from "../../api/client";

export const roles = {
  state: {
    items: [],
    total: 0,
    loading: true,
    error: "",
    query: "",
    catalog: [],
    permissionMeta: {},
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
    setLoaded(state, { items, total, catalog, permissionMeta }) {
      return {
        ...state,
        items,
        total,
        ...(Array.isArray(catalog) ? { catalog } : {}),
        ...(permissionMeta && typeof permissionMeta === "object"
          ? { permissionMeta }
          : {}),
      };
    },
    setCatalog(state, catalog) {
      return { ...state, catalog };
    },
    setPermissionMeta(state, permissionMeta) {
      return { ...state, permissionMeta: permissionMeta || {} };
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
      this.setError("");
      this.setLoading(true);
      try {
        const response = await listRoles();
        const data = response.data || {};
        const items = Array.isArray(data.roles)
          ? data.roles
          : Array.isArray(data.items)
            ? data.items
            : Array.isArray(data)
              ? data
              : [];
        const catalog = Array.isArray(data.permissions) ? data.permissions : [];
        const permissionMeta =
          data.permissionMeta && typeof data.permissionMeta === "object"
            ? data.permissionMeta
            : {};
        const total = Number(data.total) || items.length;
        this.setLoaded({ items, total, catalog, permissionMeta });
        return items;
      } catch (error) {
        this.setError(apiError(error));
        this.setLoaded({ items: [], total: 0 });
        return [];
      } finally {
        this.setLoading(false);
      }
    },

    async loadCatalog() {
      this.setCatalogLoading(true);
      try {
        const response = await listRoles();
        const data = response.data || {};
        const catalog = Array.isArray(data.permissions) ? data.permissions : [];
        const permissionMeta =
          data.permissionMeta && typeof data.permissionMeta === "object"
            ? data.permissionMeta
            : {};
        this.setCatalog(catalog);
        this.setPermissionMeta(permissionMeta);
        return catalog;
      } catch {
        this.setCatalog([]);
        this.setPermissionMeta({});
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
        this.setNotice(`${name || "Role"} was archived.`);
        await this.load();
      } catch (error) {
        this.setPageError(apiError(error));
      } finally {
        this.setPendingId(null);
      }
    },
  }),
};
