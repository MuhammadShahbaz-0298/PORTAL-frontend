/* MobileSidebar: an actual Offcanvas navigation surface, never a second desktop sidebar. */
import { Offcanvas, OffcanvasBody } from 'reactstrap';
import Sidebar from './Sidebar';
export default function MobileSidebar({ open, onClose }) { return <Offcanvas isOpen={open} toggle={onClose} direction="start" className="mobile-nav-offcanvas"><OffcanvasBody className="p-0"><Sidebar open onNavigate={onClose} mobile /></OffcanvasBody></Offcanvas>; }
