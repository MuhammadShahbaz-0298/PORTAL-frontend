/* Profile feature: account identity, security settings, and session-safe feedback. */
import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import { KeyRound, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useSelector } from "react-redux";
import * as authApi from "../../api/auth";
import { PageHeader } from "../../components/ui/PageHeader";
import ToastNotification from "../../components/ui/ToastNotification";
export default function ProfilePage() {
  const user = useSelector(state => state.auth.user);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const submit = async event => {
    event.preventDefault();
    setNotice("");
    setError("");
    if (form.newPassword !== form.confirmPassword)
      return setError("New passwords do not match.");
    try {
      await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setNotice("Password updated successfully.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.error || "Unable to update password."
      );
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="Account settings"
        title="Profile"
        description="Your identity, security, and school workspace details."
      />
      <Row className="profile-layout">
        <Col lg="5">
          <Card className="profile-identity">
            <CardBody>
              <div className="profile-avatar">
                <UserRound size={28} />
              </div>
              <div className="eyebrow">Signed-in account</div>
              <h2>{user?.name || "School account"}</h2>
              <p className="muted">{user?.email || "No email returned"} </p>
              <div className="identity-fact">
                <Mail size={16} />
                <span>Email verified by the school backend</span>
              </div>
              <div className="identity-fact">
                <ShieldCheck size={16} />
                <span>
                  Role: <strong>{user?.role || "user"}</strong>
                </span>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col lg="7">
          <Card className="profile-security">
            <CardBody>
              <div className="section-icon">
                <KeyRound size={18} />
              </div>
              <div className="eyebrow">Security</div>
              <h2>Change password</h2>
              <p className="muted">
                Use a strong password you do not reuse elsewhere.
              </p>
              <Form onSubmit={submit}>
                <FormGroup>
                  <Label>Current password</Label>
                  <Input
                    type="password"
                    required
                    value={form.currentPassword}
                    onChange={event =>
                      setForm({ ...form, currentPassword: event.target.value })
                    }
                  />
                </FormGroup>
                <FormGroup>
                  <Label>New password</Label>
                  <Input
                    type="password"
                    minLength="6"
                    required
                    value={form.newPassword}
                    onChange={event =>
                      setForm({ ...form, newPassword: event.target.value })
                    }
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Confirm new password</Label>
                  <Input
                    type="password"
                    required
                    value={form.confirmPassword}
                    onChange={event =>
                      setForm({ ...form, confirmPassword: event.target.value })
                    }
                  />
                </FormGroup>
                {error && (
                  <Alert color="danger" fade={false}>
                    {error}
                  </Alert>
                )}
                <ToastNotification message={notice} onClose={() => setNotice("")} />
                <Button type="submit" className="btn-coral">
                  Update password
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
}
