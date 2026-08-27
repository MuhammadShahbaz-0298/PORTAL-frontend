/* Assignments feature: searchable lifecycle table with explicit close confirmation and one-submit guidance. */
import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, CardBody, Form, FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { Archive, Plus, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useSelector } from 'react-redux';
import { listAssignments, createAssignment, archiveAssignment } from '../../api/assignments';
import { listBatches } from '../../api/batches';
import { domainTypes, useResource } from '../../hooks/useResource';
import { PageHeader } from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import SearchableSelect from '../../components/ui/SearchableSelect';

const [request, success, failure] = domainTypes.assignments;
const assignmentStatus = (item) => item.active === false ? 'Closed' : item.dueDate && new Date(item.dueDate) <= new Date() ? 'Expired' : 'Active';

export default function AssignmentsPage() {
  const user = useSelector((state) => state.auth.user);
  const canManage = user?.role === 'admin' || user?.role === 'teacher';
  const resource = useResource('assignments', request, success, failure, listAssignments);
  const [batchOptions, setBatchOptions] = useState([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(null);
  const [notice, setNotice] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', batch: '' });

  useEffect(() => {
    resource.load().catch(() => {});
    listBatches().then(({ data }) => setBatchOptions(Array.isArray(data) ? data : data?.items || [])).catch(() => setBatchOptions([]));
  }, []);

  const rows = useMemo(() => (resource.items || []).filter((item) => (item.title || '').toLowerCase().includes(query.toLowerCase())), [resource.items, query]);
  const create = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setNotice('');
    try {
      await createAssignment({ ...form, allowedFileTypes: ['zip'], maxFileSizeMb: 50, resubmissionPolicy: 'disabled', active: true });
      setOpen(false);
      setForm({ title: '', description: '', dueDate: '', batch: '' });
      setNotice('Assignment created successfully.');
      await resource.load();
    } catch (error) {
      setSubmitError(error.response?.data?.error || 'Unable to create assignment. Check the selected batch and required fields.');
    }
  };
  const closeAssignment = async (id) => {
    const confirmation = await Swal.fire({ title: 'Close assignment?', text: 'Students will no longer be able to upload or edit submissions after this assignment is closed.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Close assignment', cancelButtonText: 'Keep open', confirmButtonColor: '#e46b4b', cancelButtonColor: '#173044', reverseButtons: true, customClass: { popup: 'swal-linen', confirmButton: 'swal-confirm', cancelButton: 'swal-cancel' } });
    if (!confirmation.isConfirmed) return;
    setClosing(id);
    setSubmitError('');
    setNotice('');
    try {
      await archiveAssignment(id);
      setNotice('Assignment closed. New submissions are no longer accepted.');
      await resource.load();
    } catch (error) {
      setSubmitError(error.response?.data?.error || 'Unable to close assignment.');
    } finally {
      setClosing(null);
    }
  };

  return <>
    <PageHeader eyebrow="Teaching workspace" title="Assignments" description="Create briefs, keep deadlines visible, and see where learning is landing." action={canManage ? <Button className="btn-coral" onClick={() => { setSubmitError(''); setOpen(true); }}><Plus size={16} /> New assignment</Button> : null} />
    {notice && <Alert color="success" fade={false}>{notice}</Alert>}
    {submitError && <Alert color="danger" fade={false}>{submitError}</Alert>}
    <Card className="table-card"><CardBody>
      <div className="toolbar"><div className="searchbox"><Search size={16} /><Input placeholder="Search assignments" value={query} onChange={(event) => setQuery(event.target.value)} /></div></div>
      <DataTable columns={canManage ? ['Assignment', 'Batch', 'Due date', 'Status', 'Actions'] : ['Assignment', 'Batch', 'Due date', 'Status']} rows={rows} loading={resource.loading} error={resource.error} onRetry={resource.load} empty={{ title: 'No assignments', text: 'Published assignment briefs will appear here.' }} renderRow={(item) => <tr key={item._id}>
        <td><strong>{item.title}</strong><span className="row-sub">ZIP · {item.maxFileSizeMb || 50} MB maximum</span></td>
        <td>{item.batch?.name || item.batch || 'Unassigned'}</td>
        <td>{item.dueDate ? new Date(item.dueDate).toLocaleString() : '—'}</td>
        <td><span className={`assignment-status assignment-status-${assignmentStatus(item).toLowerCase()}`}>{assignmentStatus(item)}</span></td>
        {canManage && <td>{item.active === false ? <span className="muted">Closed</span> : <Button color="light" className="table-action" disabled={closing === item._id} onClick={() => closeAssignment(item._id)}><Archive size={14} /> {closing === item._id ? 'Closing…' : 'Close'}</Button>}</td>}
      </tr>} />
    </CardBody></Card>
    <Modal isOpen={open} toggle={() => setOpen(false)} fade={false} centered><ModalHeader toggle={() => setOpen(false)}>Create assignment</ModalHeader><ModalBody><Form onSubmit={create}><FormGroup><Label for="assignment-title">Title</Label><Input id="assignment-title" required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></FormGroup><FormGroup><Label for="assignment-description">Description</Label><Input id="assignment-description" type="textarea" rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></FormGroup><SearchableSelect label="Batch" placeholder="Search batches" required value={form.batch} options={batchOptions} getValue={(batch) => batch._id} getLabel={(batch) => batch.name} onChange={(value) => setForm({ ...form, batch: value })} /><FormGroup><Label for="assignment-due">Due date and time</Label><Input id="assignment-due" type="datetime-local" required value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></FormGroup>{submitError && <Alert color="danger" fade={false}>{submitError}</Alert>}<p className="form-note">ZIP uploads are capped at 50 MB. Each student can submit once and edit that submission before the deadline.</p><Button type="submit" className="btn-coral w-100">Create assignment</Button></Form></ModalBody></Modal>
  </>;
}
