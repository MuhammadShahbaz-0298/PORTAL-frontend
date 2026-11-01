/* RoleCard: the phone row for one role record in DataList. */
import { Shield } from "lucide-react";
import Badge from "../../components/ui/Badge";
import { isCoreRole, PERMISSION_LABELS } from "./rolesConfig";
import RoleActions from "./RoleActions";

export default function RoleCard({ role }) {
  const core = isCoreRole(role.name);
  const permissions = Array.isArray(role.permissions) ? role.permissions : [];

  return (
    <div className="grid gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
            <Shield size={17} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-ink">
              {role.label || role.name}
            </h3>
            <p className="truncate text-xs font-mono text-muted">{role.name}</p>
          </div>
        </div>
        <Badge tone={core ? "brand" : "neutral"}>
          {core ? "Core role" : "Custom role"}
        </Badge>
      </div>

      <div className="rounded-control bg-canvas p-2.5 text-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-muted font-medium">Assigned permissions</span>
          <span className="font-semibold text-ink">
            {permissions.length} capability
            {permissions.length === 1 ? "" : "ies"}
          </span>
        </div>
        <p className="line-clamp-2 text-muted">
          {permissions.length
            ? permissions.map(p => PERMISSION_LABELS[p] || p).join(", ")
            : "No permissions assigned"}
        </p>
      </div>

      <RoleActions role={role} layout="card" />
    </div>
  );
}
