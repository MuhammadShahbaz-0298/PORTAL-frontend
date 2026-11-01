/* Auth model: cookie session state and the only place that calls the auth endpoints. */
import * as authApi from "../../api/auth";
import { apiError } from "../../api/client";
import { clearSession, touchSession } from "../../lib/session";

const initialState = {
  user: null,
  loading: true,
  error: "",
  success: "",
};

export const auth = {
  state: initialState,

  reducers: {
    setUser(state, user) {
      return { ...state, user };
    },
    setLoading(state, loading) {
      return { ...state, loading };
    },
    setError(state, error) {
      return { ...state, error };
    },
    setSuccess(state, success) {
      return { ...state, success };
    },
    resetMessages(state) {
      return { ...state, error: "", success: "" };
    },
    reset(state) {
      return { ...state, user: null, loading: false, error: "", success: "" };
    },
  },

  effects: () => ({
    async bootstrap() {
      this.setLoading(true);
      this.setError("");
      try {
        const { data } = await authApi.me();
        touchSession();
        this.setUser(data);
      } catch {
        clearSession();
        this.setUser(null);
        this.setError("");
      } finally {
        this.setLoading(false);
      }
    },

    async login(credentials) {
      this.setLoading(true);
      this.setError("");
      this.setSuccess("");
      try {
        const { data } = await authApi.login(credentials);
        touchSession();
        this.setUser(data.user);
        return data.user;
      } catch (error) {
        const message = apiError(error);
        this.setError(message);
        throw new Error(message);
      } finally {
        this.setLoading(false);
      }
    },

    async logout() {
      try {
        await authApi.logoutSession();
      } catch {
        // The server may already have cleared the cookies; log out locally anyway.
      }
      clearSession();
      this.reset();
    },

    async refreshSession() {
      try {
        const { data } = await authApi.me();
        touchSession();
        this.setUser(data);
      } catch {
        await this.logout();
      }
    },

    async changePassword(payload) {
      this.setLoading(true);
      this.setError("");
      this.setSuccess("");
      try {
        await authApi.changePassword(payload);
        this.setSuccess("Password updated successfully.");
        return true;
      } catch (error) {
        this.setError(apiError(error));
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    touch() {
      touchSession();
    },
  }),
};
