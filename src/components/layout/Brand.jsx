/* Brand component: owns only the portal mark and wordmark. */
import { env } from "../../config/env";
export default function Brand() {
  return (
    <div className="brand">
      <img
        src={env.appLogo}
        alt="Portal brand"
        onError={event => {
          event.currentTarget.style.display = "none";
        }}
      />
      <span className="brand-mark" aria-hidden="true">
        <i />
      </span>
      <span>
        <strong>CompanyName</strong>
        <small>learning operations</small>
      </span>
    </div>
  );
}
