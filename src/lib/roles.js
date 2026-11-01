/* Account roles: one label map so badges and forms stay consistent. */
const ROLE_LABELS = {
  admin: "Administrator",
  teacher: "Teacher",
  student: "Student",
};

export function roleLabel(role) {
  if (!role) return "—";
  const key = String(role).toLowerCase();
  return ROLE_LABELS[key] || String(role);
}

export const CORE_ROLE_OPTIONS = [
  { value: "admin", label: ROLE_LABELS.admin },
  { value: "teacher", label: ROLE_LABELS.teacher },
  { value: "student", label: ROLE_LABELS.student },
];
