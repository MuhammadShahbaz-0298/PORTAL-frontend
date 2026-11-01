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
  },
});
