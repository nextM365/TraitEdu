import { useEffect, useState } from 'react';
import { fetchAdminContent, fetchFeedback, fetchStudents, fetchTeachers } from '../services/api';
import type { AdmissionRecord, Announcement, ExamManagement, ExamResult, Student, StudentFeedback, StudentFeeAccount, Teacher } from '../types';
import TeacherManagementForm from './TeacherManagementForm';
import ContentManagementForm from './ContentManagementForm';
import FeeManagementForm from './FeeManagementForm';
import AdmissionsManagementForm from './AdmissionsManagementForm';
import AnnouncementsManagementForm from './AnnouncementsManagementForm';
import ExamResultsManagementForm from './ExamResultsManagementForm';

const modules = [
  { key: 'admissions', label: 'All Admissions', description: 'View applications, manage joining details, and enroll students' },
  { key: 'teachers', label: 'Teachers, Duties & Timetables', description: 'Maintain specializations, assigned classes, duties, and teaching schedules' },
  { key: 'announcements', label: 'Announcements', description: 'Publish school news and notices' },
  { key: 'achievements', label: 'Achievements', description: 'Highlight student and school achievements' },
  { key: 'examResults', label: 'Exam Results', description: 'Maintain subjects, marks, and grades' },
  { key: 'fees', label: 'Fee Payments', description: 'Configure balances and installment dates' },
  { key: 'attendance', label: 'Attendance', description: 'Maintain attendance content and statuses' },
  { key: 'opinionPolls', label: 'Opinion Polls', description: 'Create and control school polls' },
  { key: 'parentConcerns', label: 'Parent Concerns', description: 'Review concern categories and entries' },
  { key: 'busTracking', label: 'Bus Tracking', description: 'Configure transport tracking information' },
  { key: 'wellness', label: 'Wellness', description: 'Publish parenting and wellness resources' },
  { key: 'gatePass', label: 'Gate Pass', description: 'Configure gate-pass approvals' },
  { key: 'events', label: 'Events & Gallery', description: 'Manage events, images, and galleries' },
  { key: 'studentFeedback', label: 'Student Feedback', description: 'Review feedback submitted by students' },
] as const;
const tableModuleKeys = new Set(['achievements', 'examResults', 'attendance', 'opinionPolls', 'parentConcerns', 'wellness', 'events']);

export default function AdminContentManager() {
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [selected, setSelected] = useState<(typeof modules)[number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [openingKey, setOpeningKey] = useState<string | null>(null);
  const [editorError, setEditorError] = useState('');
  const [schoolStudents, setSchoolStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetchAdminContent()
      .then(setContent)
      .finally(() => setLoading(false));
  }, []);

  async function openEditor(module: (typeof modules)[number]) {
    setOpeningKey(module.key);
    setEditorError('');
    try {
      if (module.key === 'teachers') {
        const teachers = await fetchTeachers();
        setContent(previous => ({ ...previous, teachers }));
      } else if (module.key === 'studentFeedback') {
        const studentFeedback = await fetchFeedback();
        setContent(previous => ({ ...previous, studentFeedback }));
      } else if (module.key === 'fees' || module.key === 'examResults') {
        setSchoolStudents(await fetchStudents());
      }
      setSelected(module);
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : `Unable to load ${module.label}.`);
      setSelected(module);
    } finally {
      setOpeningKey(null);
    }
  }

  if (loading) return <div className="module-card">Loading administration tools…</div>;

  return (
    <section className="admin-workspace">
      <div className="admin-workspace-heading">
        <div>
          <p className="admin-eyebrow">Content administration</p>
          <h2>Manage student app modules</h2>
          <p>Changes apply only to your school and appear in the corresponding student module.</p>
        </div>
      </div>

      <div className="admin-module-list">
        {modules.map(module => {
          const value = content[module.key];
          const count = Array.isArray(value) ? `${value.length} items` : 'Configured';
          return (
            <article className="admin-module-row" key={module.key}>
              <div className="admin-module-icon">{module.label.charAt(0)}</div>
              <div className="admin-module-copy">
                <h3>{module.label}</h3>
                <p>{module.description}</p>
              </div>
              <span className="admin-module-count">{count}</span>
              <button type="button" disabled={openingKey === module.key} onClick={() => openEditor(module)}>
                {openingKey === module.key ? 'Loading…' : module.key === 'studentFeedback' ? 'View' : 'Manage'}
              </button>
            </article>
          );
        })}
      </div>

      {selected && (
        <div className="admin-editor-backdrop" onClick={() => setSelected(null)}>
          <aside className={`admin-editor ${selected.key === 'teachers' ? 'teacher-editor' : ''} ${selected.key === 'fees' ? 'fee-editor' : ''} ${selected.key === 'admissions' ? 'admissions-editor' : ''} ${selected.key === 'announcements' ? 'announcements-editor' : ''} ${tableModuleKeys.has(selected.key) ? 'collection-table-editor' : ''}`} onClick={event => event.stopPropagation()}>
            <div className="admin-editor-heading">
              <div><span>{selected.key === 'studentFeedback' ? 'Viewing' : 'Editing'}</span><h2>{selected.label}</h2></div>
              <button type="button" className="editor-close" onClick={() => setSelected(null)}>×</button>
            </div>
            {editorError ? (
              <div className="editor-load-error">
                <p>{editorError}</p>
                <button type="button" onClick={() => openEditor(selected)}>Try again</button>
              </div>
            ) : selected.key === 'admissions' ? (
              <AdmissionsManagementForm
                admissions={(content.admissions ?? []) as AdmissionRecord[]}
                onSaved={admissions => setContent(previous => ({ ...previous, admissions }))}
              />
            ) : selected.key === 'teachers' ? (
              <TeacherManagementForm
                teachers={(content.teachers ?? []) as Teacher[]}
                onSaved={teachers => setContent(previous => ({ ...previous, teachers }))}
              />
            ) : selected.key === 'announcements' ? (
              <AnnouncementsManagementForm
                announcements={(content.announcements ?? []) as Announcement[]}
                onSaved={announcements => setContent(previous => ({ ...previous, announcements }))}
              />
            ) : selected.key === 'fees' ? (
              <FeeManagementForm
                accounts={(content.fees ?? []) as StudentFeeAccount[]}
                students={schoolStudents}
                onSaved={fees => setContent(previous => ({ ...previous, fees }))}
              />
            ) : selected.key === 'examResults' ? (
              <ExamResultsManagementForm
                results={(content.examResults ?? []) as ExamResult[]}
                students={schoolStudents}
                management={(content.examManagement ?? undefined) as ExamManagement | undefined}
                onSaved={examResults => setContent(previous => ({ ...previous, examResults }))}
                onManagementSaved={examManagement => setContent(previous => ({ ...previous, examManagement }))}
              />
            ) : selected.key === 'studentFeedback' ? (
              <>
                <p>Read-only feedback submitted by students in this branch.</p>
                <div className="feedback-table-wrap">
                  <table className="feedback-records-table">
                    <thead><tr><th>Student ID</th><th>Student</th><th>Class</th><th>Section</th><th>Submitted</th><th>Status</th><th>Feedback</th></tr></thead>
                    <tbody>
                      {((content.studentFeedback ?? []) as StudentFeedback[]).length === 0 && <tr><td colSpan={7} className="empty-state">No student feedback has been submitted.</td></tr>}
                      {((content.studentFeedback ?? []) as StudentFeedback[]).map(item => (
                        <tr key={item.id}>
                          <td>{item.studentId}</td><td><strong>{item.studentName}</strong></td><td>{item.className}</td><td>{item.section}</td>
                          <td>{new Date(item.createdAt).toLocaleString()}</td><td><span className="feedback-status">{item.status}</span></td><td className="feedback-message-cell">{item.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="admin-editor-actions">
                  <button type="button" onClick={() => setSelected(null)}>Close</button>
                </div>
              </>
            ) : (
              <ContentManagementForm
                moduleName={selected.key}
                content={content[selected.key]}
                onSaved={value => setContent(previous => ({ ...previous, [selected.key]: value }))}
              />
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
