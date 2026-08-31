import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import SearchableSelect from "../../components/ui/SearchableSelect";

const INITIAL_FORM = { name: "", teacherId: "" };

export default function BatchCreateModal({
  isOpen,
  teachers,
  error,
  onClose,
  onSubmit,
  initialValues,
  mode = "create",
}) {
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (isOpen) {
      setForm(
        initialValues || {
          name: "",
          teacherId: "",
        }
      );
    }
  }, [isOpen, initialValues]);

  const handleSubmit = async event => {
    event.preventDefault();
    if (!form.name.trim() || !form.teacherId) return;
    const created = await onSubmit({ ...form, name: form.name.trim() });
    if (created) setForm(INITIAL_FORM);
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} fade={false} centered>
      <ModalHeader toggle={onClose}>
        {mode === "edit" ? "Update batch" : "Create batch"}
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Batch name</Label>
            <Input
              required
              value={form.name}
              onChange={event =>
                setForm(current => ({ ...current, name: event.target.value }))
              }
            />
          </FormGroup>
          {teachers.error && (
            <Alert color="warning" fade={false}>
              {teachers.error}
            </Alert>
          )}
          <SearchableSelect
            label="Teacher"
            placeholder="Search teachers"
            required
            disabled={teachers.loading || Boolean(teachers.error)}
            value={form.teacherId}
            options={teachers.data || []}
            getValue={teacher => teacher._id}
            getLabel={teacher => `${teacher.name} · ${teacher.email}`}
            onChange={teacherId =>
              setForm(current => ({ ...current, teacherId }))
            }
          />
          {error && (
            <Alert color="danger" fade={false}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            className="btn-coral w-100"
            disabled={teachers.loading || Boolean(teachers.error)}
          >
            {mode === "edit" ? "Save changes" : "Create batch"}
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  );
}
