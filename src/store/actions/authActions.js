/* Auth actions: credentials stay ephemeral; only token and safe profile persist. */
import * as authApi from "../../api/auth";
import { apiError } from "../../api/client";
import { types } from "../actionTypes";

export const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;
export const AUTH_STORAGE_KEYS = {
  token: "school_portal_token",
  user: "school_portal_user",
  lastActivity: "school_portal_last_activity",
};

export const touchSession = () => {
  localStorage.setItem(AUTH_STORAGE_KEYS.lastActivity, String(Date.now()));
};

export const isSessionExpired = () => {
  const lastActivity = Number(
    localStorage.getItem(AUTH_STORAGE_KEYS.lastActivity) || 0,
  );
  if (!lastActivity) return false;
  return Date.now() - lastActivity > INACTIVITY_TIMEOUT_MS;
};

export const login = credentials => async dispatch => {
  dispatch({ type: types.AUTH_REQUEST });
  try {
    const { data } = await authApi.login(credentials);
    localStorage.setItem(AUTH_STORAGE_KEYS.token, data.token);
    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(data.user));
    touchSession();
    dispatch({ type: types.AUTH_SUCCESS, payload: data });
    return data;
  } catch (error) {
    const message = apiError(error);
    dispatch({ type: types.AUTH_FAILURE, payload: message });
    throw new Error(message);
  }
};
export const hydrateSession = () => async dispatch => {
  if (!localStorage.getItem(AUTH_STORAGE_KEYS.token)) return;
  if (isSessionExpired()) {
    localStorage.removeItem(AUTH_STORAGE_KEYS.token);
    localStorage.removeItem(AUTH_STORAGE_KEYS.user);
    localStorage.removeItem(AUTH_STORAGE_KEYS.lastActivity);
    dispatch({ type: types.AUTH_LOGOUT });
    return;
  }
  dispatch({ type: types.AUTH_REQUEST });
  try {
    const { data } = await authApi.me();
    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(data));
    touchSession();
    dispatch({
      type: types.AUTH_SUCCESS,
      payload: {
        token: localStorage.getItem(AUTH_STORAGE_KEYS.token),
        user: data,
      },
    });
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEYS.token);
    localStorage.removeItem(AUTH_STORAGE_KEYS.user);
    localStorage.removeItem(AUTH_STORAGE_KEYS.lastActivity);
    dispatch({ type: types.AUTH_LOGOUT });
  }
};
export const refreshSession = () => async dispatch => {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.token);
  if (!token) return;
  try {
    const { data } = await authApi.me();
    localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(data));
    dispatch({
      type: types.AUTH_SUCCESS,
      payload: { token, user: data },
    });
  } catch {
    dispatch(logout());
  }
};
export const logout = () => dispatch => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.token);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
  localStorage.removeItem(AUTH_STORAGE_KEYS.lastActivity);
  dispatch({ type: types.AUTH_LOGOUT });
};
