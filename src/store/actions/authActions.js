/* Auth actions: credentials stay ephemeral; only token and safe profile persist. */
import * as authApi from "../../api/auth";
import { apiError } from "../../api/client";
import { types } from "../actionTypes";
export const login = credentials => async dispatch => {
  dispatch({ type: types.AUTH_REQUEST });
  try {
    const { data } = await authApi.login(credentials);
    localStorage.setItem("techzone_token", data.token);
    localStorage.setItem("techzone_user", JSON.stringify(data.user));
    dispatch({ type: types.AUTH_SUCCESS, payload: data });
    return data;
  } catch (error) {
    const message = apiError(error);
    dispatch({ type: types.AUTH_FAILURE, payload: message });
    throw new Error(message);
  }
};
export const hydrateSession = () => async dispatch => {
  if (!localStorage.getItem("techzone_token")) return;
  dispatch({ type: types.AUTH_REQUEST });
  try {
    const { data } = await authApi.me();
    localStorage.setItem("techzone_user", JSON.stringify(data));
    dispatch({
      type: types.AUTH_SUCCESS,
      payload: { token: localStorage.getItem("techzone_token"), user: data },
    });
  } catch {
    localStorage.removeItem("techzone_token");
    localStorage.removeItem("techzone_user");
    dispatch({ type: types.AUTH_LOGOUT });
  }
};
export const logout = () => dispatch => {
  localStorage.removeItem("techzone_token");
  localStorage.removeItem("techzone_user");
  dispatch({ type: types.AUTH_LOGOUT });
};
