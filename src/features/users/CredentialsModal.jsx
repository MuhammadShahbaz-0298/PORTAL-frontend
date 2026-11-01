/* CredentialsModal: shows the one-time password, then clears it from the model. */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, Copy } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

export default function CredentialsModal() {
  const dispatch = useDispatch();
  const { credentials } = useSelector(state => state.users);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!credentials) setCopied(false);
  }, [credentials]);

  // Why: leaving the users page must not keep a password in memory.
  useEffect(() => () => dispatch.users.clearCredentials(), [dispatch]);

  const close = () => dispatch.users.closeCredentials();

  const copy = async () => {
    if (!credentials) return;
    try {
      await navigator.clipboard.writeText(
        `${credentials.email}\n${credentials.password}`
      );
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal
      open={Boolean(credentials)}
      onClose={close}
      title="One-time credentials"
      footer={<Button onClick={close}>Done</Button>}
    >
      <div className="grid gap-4">
        <div className="rounded-control border border-warning/30 bg-warning-soft px-3 py-2 text-sm font-medium text-warning">
          This password is shown once. It is cleared from the app when you close
          this panel.
        </div>

        <div className="grid gap-3 rounded-control border border-line bg-canvas p-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              Email
            </p>
            <p className="mt-1 break-all text-sm font-semibold text-ink">
              {credentials?.email}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              Initial password
            </p>
            <p className="mt-1 break-all font-mono text-base font-semibold text-ink">
              {credentials?.password}
            </p>
          </div>
        </div>

        <Button variant="secondary" onClick={copy}>
          {copied ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <Copy size={16} aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy credentials"}
        </Button>

        <p className="text-xs text-muted">
          Share these credentials securely. Closing this panel removes the
          password from the app.
        </p>
      </div>
    </Modal>
  );
}
