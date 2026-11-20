/* Notifications model: polling, unread count, mark read. */
import {
  clearAllNotifications,
  listNotifications,
  markNotificationRead,
} from "../../api/notifications";
import { apiError } from "../../api/client";

export const notifications = {
  state: {
    items: [],
    unread: 0,
    loading: false,
    error: "",
    clearing: false,
    popup: null,
    initialized: false,
  },
  reducers: {
    setLoading(state, loading) { return { ...state, loading }; },
    setError(state, error) { return { ...state, error }; },
    setClearing(state, clearing) { return { ...state, clearing }; },
    setItems(state, { items, popup, initialized }) {
      const unread = items.filter(n => !n.read).length;
      return {
        ...state,
        items,
        unread,
        popup: popup === undefined ? state.popup : popup,
        initialized: initialized === undefined ? state.initialized : initialized,
      };
    },
    markRead(state, id) {
      const items = state.items.map(n =>
        (n._id || n.id) === id ? { ...n, read: true } : n
      );
      const unread = items.filter(n => !n.read).length;
      const popupId = state.popup?._id || state.popup?.id;
      return {
        ...state,
        items,
        unread,
        popup: popupId && String(popupId) === String(id) ? null : state.popup,
      };
    },
    setPopup(state, popup) { return { ...state, popup }; },
    clearPopup(state) { return { ...state, popup: null }; },
  },
  effects: dispatch => ({
    async load(payload, rootState) {
      this.setLoading(true);
      this.setError("");
      try {
        const { data } = await listNotifications();
        const list = Array.isArray(data) ? data : data?.items || [];
        const previousState = rootState.notifications || {};
        const previous = Array.isArray(previousState.items) ? previousState.items : [];
        const previousIds = new Set(previous.map(n => String(n._id || n.id)));
        let popup = previousState.popup || null;
        if (previousState.initialized) {
          const newest = list.find(
            n => !previousIds.has(String(n._id || n.id)) && !n.read
          );
          if (newest) popup = newest;
        }
        this.setItems({ items: list, popup, initialized: true });
      } catch (error) {
        this.setError(apiError(error));
      } finally {
        this.setLoading(false);
      }
    },
    async markRead(id) {
      try {
        await markNotificationRead(id);
        dispatch.notifications.markRead(id);
        return true;
      } catch (error) {
        this.setError(apiError(error));
        return false;
      }
    },
    async clearAll() {
      this.setError("");
      this.setClearing(true);
      try {
        const { data } = await clearAllNotifications();
        this.setItems({ items: [], popup: null, initialized: true });
        return data?.deletedCount ?? 0;
      } catch (error) {
        this.setError(apiError(error));
        return false;
      } finally {
        this.setClearing(false);
      }
    },
  }),
};