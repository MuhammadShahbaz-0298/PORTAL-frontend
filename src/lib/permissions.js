/* Permission helpers: server-provided permissions are authoritative for custom roles. */
export function hasPermission(user, permission, fallbackRoles = []) {
  if (!user) return false;
  if (Array.isArray(user.permissions))
    return (
      user.permissions.includes(permission) || user.permissions.includes("*")
    );
  return fallbackRoles.includes(user.role);
}
