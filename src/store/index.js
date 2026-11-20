/* Store root: every feature is one Rematch model. To add a feature, add its model here. */
import { init } from "@rematch/core";
import { auth } from "./models/auth";
import { users } from "./models/users";
import { dashboard } from "./models/dashboard";
import { assignments } from "./models/assignments";
import { submissions } from "./models/submissions";
import { grading } from "./models/grading";
import { attendance } from "./models/attendance";
import { batches } from "./models/batches";
import { roles } from "./models/roles";
import { notifications } from "./models/notifications";
import { announcements } from "./models/announcements";
import { comments } from "./models/comments";
import { quizzes } from "./models/quizzes";
import { auditLog } from "./models/auditLog";
import { analytics } from "./models/analytics";
import { reportCards } from "./models/reportCards";
import { weightedGrades } from "./models/weightedGrades";
import { timetable } from "./models/timetable";
import { assignmentResources } from "./models/assignmentResources";
import { events } from "./models/events";
import { chat } from "./models/chat";
import { calendar } from "./models/calendar";
import { search } from "./models/search";

export const store = init({
  models: {
    auth,
    users,
    dashboard,
    assignments,
    submissions,
    grading,
    attendance,
    batches,
    roles,
    notifications,
    announcements,
    comments,
    quizzes,
    auditLog,
    analytics,
    reportCards,
    weightedGrades,
    timetable,
    assignmentResources,
    events,
    chat,
    calendar,
    search,
  },
});