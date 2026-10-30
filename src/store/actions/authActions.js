/* Auth actions: cookies carry the session; only idle activity is stored locally. */
import * as authApi from "../../api/auth";
import { apiError } from "../../api/client";
import { types } from "../actionTypes";

export const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;
export const AUTH_STORAGE_KEYS = {
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
    touchSession();
    dispatch({ type: types.AUTH_SUCCESS, payload: { user: data.user } });
    return data;
  } catch (error) {
    const message = apiError(error);
    dispatch({ type: types.AUTH_FAILURE, payload: message });
    throw new Error(message);
  }
};
export const hydrateSession = () => async dispatch => {
  dispatch({ type: types.AUTH_REQUEST });
  try {
    const { data } = await authApi.me();
    touchSession();
    dispatch({
      type: types.AUTH_SUCCESS,
      payload: { user: data },
    });
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEYS.lastActivity);
    dispatch({ type: types.AUTH_LOGOUT });
  }
};
export const refreshSession = () => async dispatch => {
  try {
    const { data } = await authApi.me();
    dispatch({
      type: types.AUTH_SUCCESS,
      payload: { user: data },
    });
  } catch {
    dispatch(logout());
  }
};
export const logout = () => async dispatch => {
  try {
    await authApi.logoutSession();
  } catch {
    // The server may already have cleared the cookies; log out locally anyway.
  }
  localStorage.removeItem(AUTH_STORAGE_KEYS.lastActivity);
  dispatch({ type: types.AUTH_LOGOUT });
};
