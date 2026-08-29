/* ConfirmDialog: explicit confirmation for deactivate/delete actions. */
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
export default function ConfirmDialog({
  isOpen,
  toggle,
  title = "Confirm action",
  message,
  onConfirm,
  busy = false,
}) {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>{title}</ModalHeader>
      <ModalBody>{message}</ModalBody>
      <ModalFooter>
        <Button color="light" onClick={toggle}>
          Cancel
        </Button>
        <Button color="danger" disabled={busy} onClick={onConfirm}>
          {busy ? "Working…" : "Confirm"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
