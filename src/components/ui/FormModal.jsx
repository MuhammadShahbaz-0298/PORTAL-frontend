/* FormModal: shared Reactstrap modal wrapper for create/edit flows. */
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
export default function FormModal({ isOpen, toggle, title, children }) { return <Modal isOpen={isOpen} toggle={toggle}><ModalHeader toggle={toggle}>{title}</ModalHeader><ModalBody>{children}</ModalBody></Modal>; }
