/* Resource reducers: named exports keep domain ownership visible in the folder tree. */
import { createDomainReducer } from "./domainReducer";
const types = name => ({
  request: `${name}_REQUEST`,
  success: `${name}_SUCCESS`,
  failure: `${name}_FAILURE`,
});
export const assignmentsReducer = createDomainReducer(types("ASSIGNMENTS"));
export const submissionsReducer = createDomainReducer(types("SUBMISSIONS"));
export const batchesReducer = createDomainReducer(types("BATCHES"));
export const attendanceReducer = createDomainReducer(types("ATTENDANCE"));
export const usersReducer = createDomainReducer(types("USERS"));
export const rolesReducer = createDomainReducer(types("ROLES"));
