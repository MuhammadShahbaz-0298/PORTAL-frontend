/* Roles config: human-readable permission labels and category groups. */
export const PERMISSION_LABELS = {
  "dashboard.view": "Dashboard",
  "students.view": "View students",
  "students.create": "Create students",
  "students.update": "Edit students",
  "students.attendance": "Student attendance",
  "batches.view": "View batches",
  "batches.create": "Create batches",
  "batches.update": "Edit batches",
  "batches.delete": "Delete batches",
  "batches.enroll": "Enroll students",
  "assignments.view": "View assignments",
  "assignments.create": "Create assignments",
  "assignments.update": "Edit assignments",
  "assignments.delete": "Archive assignments",
  "submissions.view": "View submissions",
  "submissions.grade": "Grade submissions",
  "attendance.view": "View attendance",
  "attendance.manage": "Mark attendance",
  "users.manage": "Manage accounts",
  "roles.manage": "Manage roles",
  "profile.view": "View profile",
};

export const PERMISSION_GROUPS = {
  Workspace: ["dashboard.view", "profile.view"],
  Students: [
    "students.view",
    "students.create",
    "students.update",
    "students.attendance",
  ],
  Batches: [
    "batches.view",
    "batches.create",
    "batches.update",
    "batches.delete",
    "batches.enroll",
  ],
  Assignments: [
    "assignments.view",
    "assignments.create",
    "assignments.update",
    "assignments.delete",
  ],
  Submissions: ["submissions.view", "submissions.grade"],
  Attendance: ["attendance.view", "attendance.manage"],
  Administration: ["users.manage", "roles.manage"],
};

export const CORE_ROLES = new Set(["admin", "teacher", "student"]);

export function isCoreRole(name) {
  return CORE_ROLES.has(String(name).toLowerCase());
}
