import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiError } from "../api/client";
import { toCollection } from "../lib/apiData";
import { types } from "../store/actionTypes";

const emptyResource = { data: [], loading: false, error: null };

export const domainTypes = {
  assignments: [
    types.ASSIGNMENTS_REQUEST,
    types.ASSIGNMENTS_SUCCESS,
    types.ASSIGNMENTS_FAILURE,
  ],
  submissions: [
    types.SUBMISSIONS_REQUEST,
    types.SUBMISSIONS_SUCCESS,
    types.SUBMISSIONS_FAILURE,
  ],
  batches: [
    types.BATCHES_REQUEST,
    types.BATCHES_SUCCESS,
    types.BATCHES_FAILURE,
  ],
  attendance: [
    types.ATTENDANCE_REQUEST,
    types.ATTENDANCE_SUCCESS,
    types.ATTENDANCE_FAILURE,
  ],
  users: [types.USERS_REQUEST, types.USERS_SUCCESS, types.USERS_FAILURE],
  roles: [types.ROLES_REQUEST, types.ROLES_SUCCESS, types.ROLES_FAILURE],
};

export function useResource(key, request, success, failure, fetcher) {
  const dispatch = useDispatch();
  const state = useSelector(root => root[key]) || emptyResource;

  const load = useCallback(
    async params => {
      dispatch({ type: request });

      try {
        const response = await fetcher(params);
        const data = toCollection(response.data);
        dispatch({ type: success, payload: data });
        return data;
      } catch (error) {
        dispatch({ type: failure, payload: apiError(error) });
        throw error;
      }
    },
    [dispatch, request, success, failure, fetcher]
  );

  const items = Array.isArray(state.data)
    ? state.data
    : Array.isArray(state.items)
      ? state.items
      : [];

  return {
    items,
    loading: Boolean(state.loading),
    error: state.error || null,
    load,
  };
}
