import { useMemo, useState } from 'react';
import { updateAdminContent } from '../services/api';
import type { AdmissionRecord, AdmissionStage } from '../types';

const stages: AdmissionStage[] = [
  'Admission Enquiry', 'Online Admission Form', 'Document Upload', 'Admission Review',
  'Entrance Test / Interview', 'Admission Approved', 'Fee Payment', 'Student Enrollment',
  'Generate Admission Number', 'Generate Student ID', 'Create Parent Account',
  'Create Student Login', 'Student Dashboard',
];
const statuses: AdmissionStage[] = [...stages, 'Rejected'];
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `admission-${Date.now()}-${Math.random()}`;
const standardDocuments = ['Birth certificate', 'Student photograph', 'Parent ID proof', 'Address proof', 'Previous school records'];

function emptyAdmission(): AdmissionRecord {
  return {
    id: makeId(), studentId: '', admissionNumber: '', studentName: '', dateOfBirth: '',
    parentName: '', parentPhone: '', parentEmail: '', className: '', section: '',
    joiningDate: '', previousSchool: '', status: 'Admission Enquiry',
    enquiryDate: new Date().toISOString().slice(0, 10), enquirySource: '',
    documents: standardDocuments.map(name => ({ name, status: 'Pending' })),
    reviewNotes: '', assessmentRequired: false, assessmentType: 'Entrance Test',
    assessmentDate: '', assessmentResult: 'Not required', feeStatus: 'Pending',
    feeReference: '', parentLoginId: '', parentTemporaryPassword: '',
    studentLoginId: '', studentTemporaryPassword: '', notes: '',
  };
}

function normalizeAdmission(admission: AdmissionRecord): AdmissionRecord {
  const legacyStages: Record<string, AdmissionStage> = {
    'Application received': 'Online Admission Form',
    'Documents pending': 'Document Upload',
    'Under review': 'Admission Review',
    Approved: 'Admission Approved',
    Enrolled: 'Student Dashboard',
  };
  return {
    ...emptyAdmission(),
    ...admission,
    status: legacyStages[admission.status] ?? admission.status,
    documents: admission.documents?.length ? admission.documents : standardDocuments.map(name => ({ name, status: 'Pending' })),
  };
}

function codePart(value: string) {
  return value.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 8);
}

export default function AdmissionsManagementForm({ admissions, onSaved }: {
  admissions: AdmissionRecord[];
  onSaved: (admissions: AdmissionRecord[]) => void;
}) {
  const [draft, setDraft] = useState<AdmissionRecord>(emptyAdmission());
  const [editingIndex, setEditingIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState('');

  const visibleAdmissions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return admissions.map((admission, index) => ({ admission: normalizeAdmission(admission), index })).filter(({ admission }) =>
      (statusFilter === 'all' || admission.status === statusFilter) &&
      (!query || [admission.studentName, admission.studentId, admission.admissionNumber, admission.parentName, admission.parentPhone]
        .some(value => String(value ?? '').toLowerCase().includes(query)))
    );
  }, [admissions, search, statusFilter]);

  function openNew() {
    setEditingIndex(-1);
    setDraft(emptyAdmission());
    setMessage('');
    setIsOpen(true);
  }

  function openEdit(index: number) {
    setEditingIndex(index);
    setDraft(normalizeAdmission(structuredClone(admissions[index])));
    setMessage('');
    setIsOpen(true);
  }

  function moveToStage(status: AdmissionStage) {
    setDraft(previous => {
      const next = { ...previous, status };
      const seed = codePart(previous.studentName) || 'STUDENT';
      const suffix = previous.id.replace(/[^a-z0-9]/gi, '').slice(-5).toUpperCase();
      const position = stages.indexOf(status);
      if (position >= stages.indexOf('Student Enrollment') && !next.admissionNumber) next.admissionNumber = `ADM-${new Date().getFullYear()}-${suffix}`;
      if (position >= stages.indexOf('Student Enrollment') && !next.studentId) next.studentId = `${codePart(previous.className) || 'ST'}${suffix}`;
      if (position >= stages.indexOf('Student Enrollment') && !next.studentLoginId) next.studentLoginId = next.studentId || `${seed}${suffix}`;
      if (position >= stages.indexOf('Student Enrollment') && !next.studentTemporaryPassword) next.studentTemporaryPassword = `Stu@${suffix}`;
      if (position >= stages.indexOf('Create Parent Account') && !next.parentLoginId) next.parentLoginId = `P-${next.studentId || suffix}`;
      if (position >= stages.indexOf('Create Parent Account') && !next.parentTemporaryPassword) next.parentTemporaryPassword = `Par@${suffix}`;
      return next;
    });
  }

  async function save() {
    if (!draft.studentName.trim() || !draft.parentName.trim() || !draft.className.trim()) {
      setMessage('Student name, parent name, and requested class are required.');
      return;
    }
    const currentStage = stages.indexOf(draft.status);
    if (currentStage >= stages.indexOf('Admission Approved') && draft.assessmentRequired && draft.assessmentResult !== 'Passed') {
      setMessage('Complete and pass the required entrance test/interview before approval.');
      return;
    }
    if (currentStage >= stages.indexOf('Student Enrollment') && !['Paid', 'Waived'].includes(draft.feeStatus ?? 'Pending')) {
      setMessage('Fee payment must be Paid or Waived before student enrollment.');
      return;
    }
    const updatedDraft = normalizeAdmission(draft);
    const updated = editingIndex >= 0
      ? admissions.map((item, index) => index === editingIndex ? updatedDraft : item)
      : [...admissions, updatedDraft];
    try {
      await updateAdminContent('admissions', updated);
      onSaved(updated);
      setIsOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save admission.');
    }
  }

  async function remove(index: number) {
    const admission = admissions[index];
    if (!admission || !window.confirm(`Delete the admission for ${admission.studentName}?`)) return;
    try {
      const updated = admissions.filter((_, itemIndex) => itemIndex !== index);
      await updateAdminContent('admissions', updated);
      onSaved(updated);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to delete admission.');
    }
  }

  const currentStageIndex = stages.indexOf(draft.status);

  return (
    <div className="admissions-management">
      <div className="admissions-toolbar">
        <div><strong>All Admissions</strong><span>{visibleAdmissions.length} of {admissions.length} applications</span></div>
        <button type="button" onClick={openNew}>+ New Admission</button>
      </div>
      <div className="admissions-filters">
        <label>Search<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Student, admission no., ID, parent, or phone" /></label>
        <label>Workflow stage<select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
          <option value="all">All stages</option>{statuses.map(status => <option key={status}>{status}</option>)}
        </select></label>
      </div>
      <div className="admissions-table-wrap">
        <table className="admissions-table admission-workflow-table">
          <thead><tr><th>Student</th><th>Admission No.</th><th>Student ID</th><th>Parent</th><th>Contact</th><th>Class</th><th>Documents</th><th>Fee</th><th>Current stage</th><th>Actions</th></tr></thead>
          <tbody>
            {visibleAdmissions.length === 0 && <tr><td colSpan={10} className="empty-state">No admissions match the current filters.</td></tr>}
            {visibleAdmissions.map(({ admission, index }) => {
              const verified = admission.documents?.filter(document => document.status === 'Verified').length ?? 0;
              return <tr key={admission.id}>
                <td><strong>{admission.studentName}</strong><small>{admission.dateOfBirth || 'Date of birth pending'}</small></td>
                <td>{admission.admissionNumber || 'Pending'}</td><td>{admission.studentId || 'Pending'}</td>
                <td>{admission.parentName}</td><td>{admission.parentPhone}<small>{admission.parentEmail}</small></td>
                <td>{admission.className}-{admission.section || '—'}</td><td>{verified}/{admission.documents?.length ?? 0} verified</td>
                <td>{admission.feeStatus ?? 'Pending'}</td>
                <td><span className={`admission-status ${admission.status === 'Rejected' ? 'rejected' : admission.status === 'Student Dashboard' ? 'enrolled' : ''}`}>{admission.status}</span></td>
                <td><div className="admission-row-actions">
                  <button type="button" className="admission-edit-button" onClick={() => openEdit(index)} title="Open workflow" aria-label={`Edit ${admission.studentName}`}>✎</button>
                  <button type="button" className="admission-delete-button" onClick={() => remove(index)} title="Delete admission" aria-label={`Delete ${admission.studentName}`}>⌫</button>
                </div></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>

      {isOpen && <div className="admission-popup-backdrop" onClick={() => setIsOpen(false)}>
        <section className="admission-popup admission-workflow-popup" onClick={event => event.stopPropagation()}>
          <div className="fee-popup-heading">
            <div><span>{editingIndex >= 0 ? 'Admission workflow' : 'Online admission form'}</span><h2>{draft.studentName || 'New student enquiry'}</h2></div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close">×</button>
          </div>

          <div className="admission-stage-strip" aria-label="Admission progress">
            {stages.map((stage, index) => <button type="button" key={stage} className={`${index < currentStageIndex ? 'complete' : ''} ${stage === draft.status ? 'active' : ''}`} onClick={() => moveToStage(stage)}>
              <span>{index < currentStageIndex ? '✓' : index + 1}</span><small>{stage}</small>
            </button>)}
          </div>

          <section className="admission-form-section">
            <h3>Enquiry & online admission form</h3>
            <div className="admission-form-grid">
              <label>Enquiry date<input type="date" value={draft.enquiryDate} onChange={event => setDraft({ ...draft, enquiryDate: event.target.value })} /></label>
              <label>Enquiry source<input value={draft.enquirySource} onChange={event => setDraft({ ...draft, enquirySource: event.target.value })} placeholder="Website, phone, walk-in…" /></label>
              <label>Student full name<input value={draft.studentName} onChange={event => setDraft({ ...draft, studentName: event.target.value })} /></label>
              <label>Date of birth<input type="date" value={draft.dateOfBirth} onChange={event => setDraft({ ...draft, dateOfBirth: event.target.value })} /></label>
              <label>Parent or guardian<input value={draft.parentName} onChange={event => setDraft({ ...draft, parentName: event.target.value })} /></label>
              <label>Parent phone<input value={draft.parentPhone} onChange={event => setDraft({ ...draft, parentPhone: event.target.value })} /></label>
              <label>Parent email<input type="email" value={draft.parentEmail} onChange={event => setDraft({ ...draft, parentEmail: event.target.value })} /></label>
              <label>Previous school<input value={draft.previousSchool} onChange={event => setDraft({ ...draft, previousSchool: event.target.value })} /></label>
              <label>Requested class<input value={draft.className} onChange={event => setDraft({ ...draft, className: event.target.value })} /></label>
              <label>Section<input value={draft.section} onChange={event => setDraft({ ...draft, section: event.target.value })} /></label>
              <label>Joining date<input type="date" value={draft.joiningDate} onChange={event => setDraft({ ...draft, joiningDate: event.target.value })} /></label>
              <label>Current stage<select value={draft.status} onChange={event => moveToStage(event.target.value as AdmissionStage)}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label>
            </div>
          </section>

          <section className="admission-form-section">
            <h3>Document upload & verification</h3>
            <div className="admission-document-list">{draft.documents?.map((document, index) => <div key={`${document.name}-${index}`}>
              <input value={document.name} aria-label="Document name" onChange={event => setDraft({ ...draft, documents: draft.documents?.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) })} />
              <select value={document.status} aria-label={`${document.name} status`} onChange={event => setDraft({ ...draft, documents: draft.documents?.map((item, itemIndex) => itemIndex === index ? { ...item, status: event.target.value as 'Pending' | 'Uploaded' | 'Verified' } : item) })}><option>Pending</option><option>Uploaded</option><option>Verified</option></select>
            </div>)}</div>
          </section>

          <section className="admission-form-section">
            <h3>Review, entrance test or interview</h3>
            <div className="admission-form-grid">
              <label className="check-field"><input type="checkbox" checked={draft.assessmentRequired} onChange={event => setDraft({ ...draft, assessmentRequired: event.target.checked, assessmentResult: event.target.checked ? 'Pending' : 'Not required' })} /> Entrance test / interview required</label>
              <label>Assessment type<select disabled={!draft.assessmentRequired} value={draft.assessmentType} onChange={event => setDraft({ ...draft, assessmentType: event.target.value as AdmissionRecord['assessmentType'] })}><option>Entrance Test</option><option>Interview</option><option>Both</option></select></label>
              <label>Assessment date<input disabled={!draft.assessmentRequired} type="datetime-local" value={draft.assessmentDate} onChange={event => setDraft({ ...draft, assessmentDate: event.target.value })} /></label>
              <label>Assessment result<select disabled={!draft.assessmentRequired} value={draft.assessmentResult} onChange={event => setDraft({ ...draft, assessmentResult: event.target.value as AdmissionRecord['assessmentResult'] })}><option>Pending</option><option>Passed</option><option>Failed</option><option>Not required</option></select></label>
              <label className="wide-field">Admission review notes<textarea rows={3} value={draft.reviewNotes} onChange={event => setDraft({ ...draft, reviewNotes: event.target.value })} /></label>
            </div>
          </section>

          <section className="admission-form-section">
            <h3>Fees, enrollment & generated accounts</h3>
            <div className="admission-form-grid">
              <label>Fee payment status<select value={draft.feeStatus} onChange={event => setDraft({ ...draft, feeStatus: event.target.value as AdmissionRecord['feeStatus'] })}><option>Pending</option><option>Partially Paid</option><option>Paid</option><option>Waived</option></select></label>
              <label>Payment reference<input value={draft.feeReference} onChange={event => setDraft({ ...draft, feeReference: event.target.value })} /></label>
              <label>Admission number<input value={draft.admissionNumber} onChange={event => setDraft({ ...draft, admissionNumber: event.target.value })} /></label>
              <label>Student ID<input value={draft.studentId} onChange={event => setDraft({ ...draft, studentId: event.target.value })} /></label>
              <label>Parent login ID<input value={draft.parentLoginId} onChange={event => setDraft({ ...draft, parentLoginId: event.target.value })} /></label>
              <label>Parent temporary password<input value={draft.parentTemporaryPassword} onChange={event => setDraft({ ...draft, parentTemporaryPassword: event.target.value })} /></label>
              <label>Student login ID<input value={draft.studentLoginId} onChange={event => setDraft({ ...draft, studentLoginId: event.target.value })} /><small>Created automatically when the student is enrolled.</small></label>
              <label>Student temporary password<input value={draft.studentTemporaryPassword} onChange={event => setDraft({ ...draft, studentTemporaryPassword: event.target.value })} /><small>Use this with the selected school and branch on the login page.</small></label>
              <label className="wide-field">Internal notes<textarea rows={3} value={draft.notes} onChange={event => setDraft({ ...draft, notes: event.target.value })} /></label>
            </div>
          </section>

          {message && <p className="feedback-error">{message}</p>}
          <div className="admission-form-actions"><button type="button" className="secondary" onClick={() => setIsOpen(false)}>Cancel</button><button type="button" onClick={save}>Save workflow</button></div>
        </section>
      </div>}
    </div>
  );
}
