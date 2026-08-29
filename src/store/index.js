/* Store root: Redux remains plain and feature reducers stay independently testable. */
import { applyMiddleware, combineReducers, createStore } from "redux";
import { thunk } from "redux-thunk";
import { types } from "./actionTypes";
import {
  assignmentsReducer,
  submissionsReducer,
  batchesReducer,
  attendanceReducer,
  usersReducer,
  rolesReducer,
} from "./reducers/resources";

const savedUser = JSON.parse(localStorage.getItem("techzone_user") || "null");
const authInitial = {
  user: savedUser,
  token: localStorage.getItem("techzone_token"),
  loading: Boolean(localStorage.getItem("techzone_token")),
  error: null,
};
export const authReducer = (state = authInitial, action) => {
  switch (action.type) {
    case types.AUTH_REQUEST:
      return { ...state, loading: true, error: null };
    case types.AUTH_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case types.AUTH_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case types.AUTH_LOGOUT:
      return { ...state, loading: false, user: null, token: null, error: null };
    default:
      return state;
  }
};
export const rootReducer = combineReducers({
  auth: authReducer,
  assignments: assignmentsReducer,
  submissions: submissionsReducer,
  batches: batchesReducer,
  attendance: attendanceReducer,
  users: usersReducer,
  roles: rolesReducer,
});
export const store = createStore(rootReducer, applyMiddleware(thunk));
