import { useMemo } from "react";
import { Alert, Button, Form, Modal, ModalBody, ModalHeader } from "reactstrap";
import SearchableSelect from "../../components/ui/SearchableSelect";

export default function BatchEnrollmentModal({
  isOpen,
  batch,
  students,
  enrolled,
  studentId,
  error,
  onClose,
  onStudentChange,
  onSubmit,
}) {
  const availableStudents = useMemo(
    () =>
      (students.data || []).filter(
        student =>
          student.active !== false &&
          !enrolled.some(
            enrolledStudent =>
              String(enrolledStudent._id) === String(student._id)
          )
      ),
    [students.data, enrolled]
  );

  return (
    <Modal isOpen={isOpen} toggle={onClose} fade={false} centered>
      <ModalHeader toggle={onClose}>
        Enroll students · {batch?.name}
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={onSubmit}>
          {students.error && (
            <Alert color="warning" fade={false}>
              {students.error}
            </Alert>
          )}
          <SearchableSelect
            label="Student not yet enrolled"
            placeholder="Search students"
            required
            disabled={students.loading || Boolean(students.error)}
            value={studentId}
            options={availableStudents}
            getValue={student => student._id}
            getLabel={student => `${student.name} · ${student.email}`}
            onChange={onStudentChange}
          />
          {enrolled.length > 0 && (
            <div className="enrolled-list">
              <div className="eyebrow">Enrolled students</div>
              {enrolled.map(student => (
                <div className="enrolled-row" key={student._id}>
                  {student.name}
                  <span>{student.email}</span>
                </div>
              ))}
            </div>
          )}
          {!students.loading &&
            !students.error &&
            availableStudents.length === 0 && (
              <p className="muted">
                All active students are enrolled in this batch.
              </p>
            )}
          {error && (
            <Alert color="danger" fade={false}>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            className="btn-coral w-100"
            disabled={!studentId || students.loading || Boolean(students.error)}
          >
            Enroll student
          </Button>
        </Form>
      </ModalBody>
    </Modal>
  );
}
