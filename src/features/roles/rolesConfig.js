/* Roles config: core role helpers. Labels and groups come from permissionMeta. */
export const CORE_ROLES = new Set(["admin", "teacher", "student"]);

export function isCoreRole(name) {
  return CORE_ROLES.has(String(name).toLowerCase());
}
