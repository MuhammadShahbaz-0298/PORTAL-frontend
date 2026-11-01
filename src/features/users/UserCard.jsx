/* UserCard: phone row for the users list. */
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import { roleLabel } from "../../lib/roles";
import UserActions from "./UserActions";

export default function UserCard({ user }) {
  const archived = Boolean(user.archivedAt);
  const active = user.active !== false && !archived;

  return (
    <div className="grid gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={user.name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">
              {user.name}
            </p>
            <p className="truncate text-sm text-muted">{user.email}</p>
          </div>
        </div>
        <Badge tone={archived ? "neutral" : active ? "success" : "danger"}>
          {archived ? "Archived" : active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Badge tone="brand">{roleLabel(user.role)}</Badge>
      </div>

      <UserActions user={user} layout="card" />
    </div>
  );
}
