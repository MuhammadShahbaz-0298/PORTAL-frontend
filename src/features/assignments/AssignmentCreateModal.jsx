import {
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
import ToastNotification from "../../components/ui/ToastNotification";

const toAssignmentDateInput = value => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

export default function AssignmentCreateModal({
  isOpen,
  form,
  batches,
  error,
  onClose,
  onChange,
  onSubmit,
  mode = "create",
}) {
  return (
    <Modal isOpen={isOpen} toggle={onClose} fade={false} centered>
      <ModalHeader toggle={onClose}>
        {mode === "edit" ? "Edit assignment" : "Create assignment"}
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={onSubmit}>
          <FormGroup>
            <Label for="assignment-title">Title</Label>
            <Input
              id="assignment-title"
              required
              value={form.title}
              onChange={event => onChange("title", event.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="assignment-description">Description</Label>
            <Input
              id="assignment-description"
              type="textarea"
              rows="4"
              value={form.description}
              onChange={event => onChange("description", event.target.value)}
            />
          </FormGroup>
          <SearchableSelect
            label="Batch"
            placeholder="Search batches"
            required
            value={form.batch}
            options={batches}
            getValue={batch => batch._id}
            getLabel={batch => batch.name}
            onChange={value => onChange("batch", value)}
          />
          <FormGroup>
            <Label for="assignment-due">Due date and time</Label>
            <Input
              id="assignment-due"
              type="datetime-local"
              required
              value={toAssignmentDateInput(form.dueDate)}
              onChange={event => {
                const raw = event.target.value;
                if (!raw) return onChange("dueDate", "");
                const localDate = new Date(raw);
                onChange("dueDate", localDate.toISOString());
              }}
            />
          </FormGroup>
          <ToastNotification
            message={error}
            variant="error"
            onClose={() => {}}
          />
          <p className="form-note">
            ZIP uploads are capped at 50 MB. Each student can submit once and
            edit that submission before the deadline.
          </p>
          <Button type="submit" className="btn-coral w-100">
            {mode === "edit" ? "Save changes" : "Create assignment"}
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  );
}
