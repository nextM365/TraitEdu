import { useEffect, useMemo, useState } from 'react';
import { updateAdminContent, updateTeacherAdminContent } from '../services/api';
import type { Teacher, TeachingSession } from '../types';

const specializationOptions = [
  'Language 1 — English',
  'Language 2 — Hindi',
  'Mathematics',
  'Science',
  'Social Studies',
  'General Knowledge',
  'Physical Training',
];
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function emptySession(): TeachingSession {
  return { id: globalThis.crypto?.randomUUID?.() ?? `session-${Date.now()}-${Math.random()}`, dayOfWeek: 'Monday', startTime: '09:00', endTime: '09:45', className: '', section: '', subject: '', room: '' };
}

function emptyTeacher(): Teacher {
  return {
    id: '',
    name: '',
    subject: '',
    specializations: [],
    email: '',
    assignments: [{ className: '', section: '' }],
    duties: [],
    schedule: [emptySession()],
  };
}

export default function TeacherManagementForm({
  teachers,
  onSaved,
}: {
  teachers: Teacher[];
  onSaved: (teachers: Teacher[]) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [draft, setDraft] = useState<Teacher>(emptyTeacher());
  const [dutiesText, setDutiesText] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [loginEnabled, setLoginEnabled] = useState(true);

  useEffect(() => {
    const teacher = selectedIndex >= 0 ? teachers[selectedIndex] : undefined;
    setDraft(teacher ? structuredClone(teacher) : emptyTeacher());
    setDutiesText(teacher?.duties.join('\n') ?? '');
    setLoginId(teacher?.loginId ?? teacher?.id ?? '');
    setTemporaryPassword('');
    setLoginEnabled(teacher?.loginEnabled !== false);
    setMessage('');
  }, [selectedIndex, teachers]);

  const visibleTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return teachers.map((teacher, index) => ({ teacher, index })).filter(({ teacher }) =>
      !query || [teacher.id, teacher.name, teacher.email, teacher.subject, ...teacher.specializations]
        .some(value => String(value).toLowerCase().includes(query))
    );
  }, [teachers, search]);

  function openEditor(index: number) {
    setSelectedIndex(index);
    setIsEditorOpen(true);
  }

  function patchAssignment(index: number, field: 'className' | 'section', value: string) {
    setDraft(previous => ({
      ...previous,
      assignments: previous.assignments.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
  }

  function patchSession(index: number, field: keyof TeachingSession, value: string) {
    setDraft(previous => ({
      ...previous,
      schedule: previous.schedule.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
  }

  async function saveTeacher() {
    if (!draft.id.trim() || !draft.name.trim() || !draft.email.trim() || !loginId.trim()) {
      setMessage('Teacher ID, name, email, and login ID are required.');
      return;
    }
    if (selectedIndex < 0 && temporaryPassword.length < 6) {
      setMessage('A temporary password of at least 6 characters is required.');
      return;
    }
    if (selectedIndex < 0 && teachers.some(item => item.id.toLowerCase() === draft.id.toLowerCase())) {
      setMessage('Teacher ID already exists in this branch.');
      return;
    }
    const normalized = {
      ...draft,
      duties: dutiesText.split('\n').map(item => item.trim()).filter(Boolean),
      assignments: draft.assignments.filter(item => item.className.trim() && item.section.trim()),
      schedule: draft.schedule.filter(item => item.className.trim() && item.section.trim() && item.subject.trim()),
      loginId: loginId.trim(),
      loginEnabled,
    };
    const updated = selectedIndex >= 0
      ? teachers.map((item, index) => index === selectedIndex ? normalized : item)
      : [...teachers, normalized];
    try {
      await updateTeacherAdminContent(updated, {
        teacherId: normalized.id,
        loginId: loginId.trim(),
        password: temporaryPassword || undefined,
        enabled: loginEnabled,
      });
      onSaved(updated);
      setMessage('Teacher details saved.');
      if (selectedIndex < 0) setSelectedIndex(updated.length - 1);
      setIsEditorOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save teacher.');
    }
  }

  async function deleteTeacher() {
    if (selectedIndex < 0) return;
    const updated = teachers.filter((_, index) => index !== selectedIndex);
    try {
      await updateAdminContent('teachers', updated);
      onSaved(updated);
      setSelectedIndex(updated.length ? 0 : -1);
      setIsEditorOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to remove teacher.');
    }
  }

  return (
    <div className="teacher-management-form">
      <section className="teacher-table-page">
        <div className="teacher-table-toolbar">
          <div><strong>All Teachers</strong><span>{visibleTeachers.length} of {teachers.length} teachers</span></div>
          <button type="button" onClick={() => openEditor(-1)}>+ Add Teacher</button>
        </div>
        <label className="teacher-search">Search
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Name, ID, email, subject, or specialization" />
        </label>
        <div className="teacher-records-wrap">
          <table className="teacher-records-table">
            <thead><tr><th>ID</th><th>Teacher</th><th>Email</th><th>Login</th><th>Primary subject</th><th>Specializations</th><th>Classes</th><th>Duties</th><th>Weekly sessions</th><th>Actions</th></tr></thead>
            <tbody>
              {visibleTeachers.length === 0 && <tr><td colSpan={10} className="empty-state">No teachers match this search.</td></tr>}
              {visibleTeachers.map(({ teacher, index }) => <tr key={teacher.id}>
                <td>{teacher.id}</td><td><strong>{teacher.name}</strong></td><td>{teacher.email}</td>
                <td><span className={`login-status ${teacher.loginEnabled === false ? 'disabled' : 'enabled'}`}>{teacher.loginEnabled === false ? 'Disabled' : teacher.loginId ?? teacher.id}</span></td><td>{teacher.subject}</td>
                <td>{teacher.specializations.join(', ')}</td><td>{teacher.assignments.map(item => `${item.className}-${item.section}`).join(', ')}</td>
                <td>{teacher.duties.length}</td><td>{teacher.schedule.length}</td>
                <td><div className="teacher-row-actions">
                  <button type="button" title="View and edit teacher" onClick={() => openEditor(index)}>✎</button>
                  <button type="button" className="delete" title="Delete teacher" onClick={() => {
                    if (!window.confirm(`Delete ${teacher.name}?`)) return;
                    const updated = teachers.filter((_, itemIndex) => itemIndex !== index);
                    updateAdminContent('teachers', updated).then(() => onSaved(updated)).catch(error => setMessage(error instanceof Error ? error.message : 'Unable to remove teacher.'));
                  }}>⌫</button>
                </div></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </section>
      {message && !isEditorOpen && <p className="feedback-error">{message}</p>}

      {isEditorOpen && <div className="teacher-edit-backdrop" onClick={() => setIsEditorOpen(false)}>
      <section className="teacher-edit-popup" onClick={event => event.stopPropagation()}>
      <div className="fee-popup-heading">
        <div><span>{selectedIndex >= 0 ? 'Teacher details' : 'New teacher'}</span><h2>{draft.name || 'Add Teacher'}</h2></div>
        <button type="button" onClick={() => setIsEditorOpen(false)} aria-label="Close">×</button>
      </div>
      <div className="teacher-picker">
        <label>Teacher
          <select value={selectedIndex} onChange={event => setSelectedIndex(Number(event.target.value))}>
            {teachers.map((teacher, index) => <option value={index} key={teacher.id}>{teacher.name} · {teacher.id}</option>)}
            <option value={-1}>+ Add new teacher</option>
          </select>
        </label>
      </div>

      <div className="teacher-form-grid">
        <label>Teacher ID<input value={draft.id} onChange={event => setDraft({ ...draft, id: event.target.value })} /></label>
        <label>Full name<input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} /></label>
        <label>Email<input type="email" value={draft.email} onChange={event => setDraft({ ...draft, email: event.target.value })} /></label>
        <label>Primary subject<input value={draft.subject} onChange={event => setDraft({ ...draft, subject: event.target.value })} /></label>
      </div>

      <fieldset className="teacher-login-fields">
        <legend>Teacher login</legend>
        <div className="teacher-form-grid">
          <label>Login ID<input value={loginId} onChange={event => setLoginId(event.target.value)} placeholder="Teacher login ID" /></label>
          <label>{selectedIndex >= 0 ? 'Reset password (optional)' : 'Temporary password'}<input type="password" value={temporaryPassword} onChange={event => setTemporaryPassword(event.target.value)} placeholder={selectedIndex >= 0 ? 'Leave blank to keep current password' : 'Minimum 6 characters'} /></label>
        </div>
        <label className="teacher-login-toggle"><input type="checkbox" checked={loginEnabled} onChange={event => setLoginEnabled(event.target.checked)} /> Allow this teacher to sign in</label>
        {selectedIndex < 0 && <p>The teacher will use the selected school, this branch, login ID, and temporary password.</p>}
      </fieldset>

      <fieldset>
        <legend>Specializations</legend>
        <div className="specialization-options">
          {specializationOptions.map(option => (
            <label key={option}>
              <input
                type="checkbox"
                checked={draft.specializations.includes(option)}
                onChange={event => setDraft({
                  ...draft,
                  specializations: event.target.checked
                    ? [...draft.specializations, option]
                    : draft.specializations.filter(item => item !== option),
                })}
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Assigned classes and sections</legend>
        {draft.assignments.map((assignment, index) => (
          <div className="assignment-form-row" key={index}>
            <input aria-label="Class" placeholder="Class" value={assignment.className} onChange={event => patchAssignment(index, 'className', event.target.value)} />
            <input aria-label="Section" placeholder="Section" value={assignment.section} onChange={event => patchAssignment(index, 'section', event.target.value)} />
            <button type="button" onClick={() => setDraft({ ...draft, assignments: draft.assignments.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button>
          </div>
        ))}
        <button type="button" className="form-add-button" onClick={() => setDraft({ ...draft, assignments: [...draft.assignments, { className: '', section: '' }] })}>+ Add class</button>
      </fieldset>

      <label className="duties-field">Duties
        <textarea rows={4} value={dutiesText} onChange={event => setDutiesText(event.target.value)} placeholder="Enter one duty per line" />
      </label>

      <fieldset>
        <legend>Weekly timetable</legend>
        <div className="timetable-form">
          {draft.schedule.map((session, index) => (
            <div className="timetable-form-row" key={session.id}>
              <select aria-label="Day" value={session.dayOfWeek} onChange={event => patchSession(index, 'dayOfWeek', event.target.value)}>
                {weekdays.map(day => <option key={day}>{day}</option>)}
              </select>
              <input aria-label="Start time" type="time" value={session.startTime} onChange={event => patchSession(index, 'startTime', event.target.value)} />
              <input aria-label="End time" type="time" value={session.endTime} onChange={event => patchSession(index, 'endTime', event.target.value)} />
              <input aria-label="Subject" placeholder="Subject" value={session.subject} onChange={event => patchSession(index, 'subject', event.target.value)} />
              <input aria-label="Class" placeholder="Class" value={session.className} onChange={event => patchSession(index, 'className', event.target.value)} />
              <input aria-label="Section" placeholder="Section" value={session.section} onChange={event => patchSession(index, 'section', event.target.value)} />
              <input aria-label="Room" placeholder="Room" value={session.room} onChange={event => patchSession(index, 'room', event.target.value)} />
              <button type="button" onClick={() => setDraft({ ...draft, schedule: draft.schedule.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button>
            </div>
          ))}
        </div>
        <button type="button" className="form-add-button" onClick={() => setDraft({ ...draft, schedule: [...draft.schedule, emptySession()] })}>+ Add timetable row</button>
      </fieldset>

      {message && <p className="editor-message">{message}</p>}
      <div className="teacher-form-actions">
        {selectedIndex >= 0 && <button type="button" className="danger" onClick={deleteTeacher}>Remove teacher</button>}
        <button type="button" className="secondary" onClick={() => setIsEditorOpen(false)}>Cancel</button>
        <button type="button" onClick={saveTeacher}>Save teacher</button>
      </div>
      </section>
      </div>}
    </div>
  );
}
