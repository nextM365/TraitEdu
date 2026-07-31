import { useMemo, useState } from 'react';
import { updateAdminContent } from '../services/api';
import type { ExamManagement, ExamResult, ExamSchedule, ExamSeries, Student } from '../types';

const makeId = (prefix: string) => globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random()}`;
const blankSeries = (): ExamSeries => ({ id: makeId('series'), academicYear: '2026-27', name: '', startDate: '', endDate: '', status: 'Draft' });
const blankSchedule = (seriesId = ''): ExamSchedule => ({ id: makeId('schedule'), seriesId, className: '', section: '', subject: '', examDate: '', startTime: '09:30', endTime: '11:30', room: '', status: 'Draft' });

const defaultManagement: ExamManagement = {
  series: [], schedules: [],
  gradeRules: [
    { id: 'ap', label: 'A+', minimum: 91, maximum: 100 }, { id: 'a', label: 'A', minimum: 81, maximum: 90 },
    { id: 'bp', label: 'B+', minimum: 71, maximum: 80 }, { id: 'b', label: 'B', minimum: 61, maximum: 70 },
    { id: 'c', label: 'C', minimum: 51, maximum: 60 }, { id: 'd', label: 'D', minimum: 35, maximum: 50 },
    { id: 'f', label: 'Fail', minimum: 0, maximum: 34 },
  ],
};

type Tab = 'series' | 'schedule' | 'marks' | 'results';

export default function ExamResultsManagementForm({ results, students, management = defaultManagement, onSaved, onManagementSaved }: {
  results: ExamResult[];
  students: Student[];
  management?: ExamManagement;
  onSaved: (results: ExamResult[]) => void;
  onManagementSaved: (management: ExamManagement) => void;
}) {
  const [tab, setTab] = useState<Tab>('series');
  const [seriesDraft, setSeriesDraft] = useState<ExamSeries | null>(null);
  const [scheduleDraft, setScheduleDraft] = useState<ExamSchedule | null>(null);
  const [seriesFilter, setSeriesFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [markDrafts, setMarkDrafts] = useState<Record<string, string>>({});
  const [commentStudent, setCommentStudent] = useState<Student | null>(null);
  const [teacherComment, setTeacherComment] = useState('');
  const [schoolComment, setSchoolComment] = useState('');
  const [message, setMessage] = useState('');

  const classes = useMemo(() => [...new Set(students.map(item => item.className))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })), [students]);
  const sections = useMemo(() => [...new Set(students.filter(item => !classFilter || item.className === classFilter).map(item => item.section))].sort(), [students, classFilter]);
  const matchingSchedules = management.schedules.filter(item =>
    (!seriesFilter || item.seriesId === seriesFilter) && (!classFilter || item.className === classFilter) && (!sectionFilter || item.section === sectionFilter)
  );
  const subjects = [...new Set(matchingSchedules.map(item => item.subject))].sort();
  const matchingStudents = students.filter(item => (!classFilter || item.className === classFilter) && (!sectionFilter || item.section === sectionFilter));
  const selectedSeries = management.series.find(item => item.id === seriesFilter);

  function gradeFor(marks: number, maxMarks = 100) {
    const percentage = maxMarks ? (marks / maxMarks) * 100 : 0;
    return management.gradeRules.find(rule => percentage >= rule.minimum && percentage <= rule.maximum)?.label ?? '—';
  }

  async function saveManagement(next: ExamManagement, success: string) {
    try {
      await updateAdminContent('examManagement', next);
      onManagementSaved(next);
      setSeriesDraft(null);
      setScheduleDraft(null);
      setMessage(success);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save exam configuration.');
    }
  }

  function saveSeries() {
    if (!seriesDraft?.name.trim() || !seriesDraft.academicYear.trim()) return setMessage('Academic year and exam-series name are required.');
    const exists = management.series.some(item => item.id === seriesDraft.id);
    saveManagement({ ...management, series: exists ? management.series.map(item => item.id === seriesDraft.id ? seriesDraft : item) : [...management.series, seriesDraft] }, 'Exam series saved.');
  }

  function saveSchedule() {
    if (!scheduleDraft || !scheduleDraft.seriesId || !scheduleDraft.className || !scheduleDraft.section || !scheduleDraft.subject || !scheduleDraft.examDate) {
      return setMessage('Series, class, section, subject, and exam date are required.');
    }
    const exists = management.schedules.some(item => item.id === scheduleDraft.id);
    saveManagement({ ...management, schedules: exists ? management.schedules.map(item => item.id === scheduleDraft.id ? scheduleDraft : item) : [...management.schedules, scheduleDraft] }, 'Exam schedule saved.');
  }

  function removeSeries(series: ExamSeries) {
    if (!window.confirm(`Delete ${series.name} and all of its schedules?`)) return;
    saveManagement({ ...management, series: management.series.filter(item => item.id !== series.id), schedules: management.schedules.filter(item => item.seriesId !== series.id) }, 'Exam series deleted.');
  }

  function removeSchedule(schedule: ExamSchedule) {
    if (!window.confirm(`Delete the ${schedule.subject} schedule?`)) return;
    saveManagement({ ...management, schedules: management.schedules.filter(item => item.id !== schedule.id) }, 'Schedule deleted.');
  }

  async function saveMarks(publish: boolean) {
    if (!seriesFilter || !classFilter || !sectionFilter || !subjectFilter) return setMessage('Select exam series, class, section, and subject.');
    const schedule = management.schedules.find(item => item.seriesId === seriesFilter && item.className === classFilter && item.section === sectionFilter && item.subject === subjectFilter);
    if (!schedule) return setMessage('Create the subject schedule before entering marks.');
    const next = [...results];
    for (const student of matchingStudents) {
      const raw = markDrafts[student.id];
      const previous = next.find(item => item.seriesId === seriesFilter && item.studentId === student.id && item.subject === subjectFilter);
      if (raw === undefined && !previous) continue;
      const marks = raw === undefined ? Number(previous?.marks ?? 0) : Number(raw);
      if (marks < 0 || marks > 100) return setMessage(`Marks for ${student.name} must be between 0 and 100.`);
      const record: ExamResult = {
        ...(previous ?? {}), id: previous?.id ?? makeId('mark'), seriesId: seriesFilter,
        examName: selectedSeries?.name, academicYear: selectedSeries?.academicYear,
        studentId: student.id, studentName: student.name, className: student.className, section: student.section,
        subject: subjectFilter, marks, maxMarks: 100, grade: gradeFor(marks), status: publish ? 'Published' : previous?.status ?? 'Draft',
      };
      const index = next.indexOf(previous as ExamResult);
      if (index >= 0) next[index] = record; else next.push(record);
    }
    try {
      await updateAdminContent('examResults', next);
      onSaved(next);
      setMarkDrafts({});
      setMessage(publish ? 'Marks saved and results published.' : 'Draft marks saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save marks.');
    }
  }

  function currentMark(studentId: string) {
    return results.find(item => item.seriesId === seriesFilter && item.studentId === studentId && item.subject === subjectFilter);
  }

  function openComments(student: Student) {
    const record = results.find(item => item.seriesId === seriesFilter && item.studentId === student.id);
    setCommentStudent(student);
    setTeacherComment(record?.teacherComment ?? '');
    setSchoolComment(record?.schoolComment ?? '');
  }

  async function saveComments() {
    if (!commentStudent || !seriesFilter) return;
    const updated = results.map(item => item.seriesId === seriesFilter && item.studentId === commentStudent.id
      ? { ...item, teacherComment, schoolComment }
      : item
    );
    try {
      await updateAdminContent('examResults', updated);
      onSaved(updated);
      setCommentStudent(null);
      setMessage('Report-card comments saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save comments.');
    }
  }

  return <div className="exam-module">
    <nav className="exam-admin-tabs">
      {([['series', 'Exam Series'], ['schedule', 'Schedules'], ['marks', 'Mark Entry'], ['results', 'Results & Analysis']] as const).map(([key, label]) =>
        <button type="button" key={key} className={tab === key ? 'active' : ''} onClick={() => { setTab(key); setMessage(''); }}>{label}</button>
      )}
    </nav>
    {message && <p className="exam-admin-message">{message}</p>}

    {tab === 'series' && <>
      <div className="exam-section-heading"><div><h3>Academic year exam series</h3><p>Every series keeps its own schedule and results history.</p></div><button type="button" onClick={() => setSeriesDraft(blankSeries())}>+ Create exam series</button></div>
      <div className="exam-student-table-wrap"><table className="exam-student-table"><thead><tr><th>Academic year</th><th>Exam series</th><th>Start</th><th>End</th><th>Schedules</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {management.series.length === 0 && <tr><td colSpan={7} className="empty-state">No exam series created.</td></tr>}
        {management.series.map(item => <tr key={item.id}><td>{item.academicYear}</td><td><strong>{item.name}</strong></td><td>{item.startDate || '—'}</td><td>{item.endDate || '—'}</td><td>{management.schedules.filter(schedule => schedule.seriesId === item.id).length}</td><td><span className={`exam-publish-status ${item.status.toLowerCase()}`}>{item.status}</span></td><td><div className="generic-row-actions"><button type="button" onClick={() => setSeriesDraft({ ...item })}>✎</button><button type="button" className="delete" onClick={() => removeSeries(item)}>⌫</button></div></td></tr>)}
      </tbody></table></div>
    </>}

    {tab === 'schedule' && <>
      <div className="exam-section-heading"><div><h3>Class and section schedules</h3><p>Only published schedules are shown to eligible students.</p></div><button type="button" onClick={() => setScheduleDraft(blankSchedule(management.series[0]?.id))}>+ Add subject schedule</button></div>
      <div className="exam-student-table-wrap"><table className="exam-student-table"><thead><tr><th>Series</th><th>Class</th><th>Section</th><th>Subject</th><th>Date</th><th>Time</th><th>Room</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {management.schedules.length === 0 && <tr><td colSpan={9} className="empty-state">No schedules created.</td></tr>}
        {management.schedules.map(item => <tr key={item.id}><td>{management.series.find(series => series.id === item.seriesId)?.name ?? 'Unknown'}</td><td>{item.className}</td><td>{item.section}</td><td><strong>{item.subject}</strong></td><td>{item.examDate}</td><td>{item.startTime}–{item.endTime}</td><td>{item.room}</td><td><span className={`exam-publish-status ${item.status.toLowerCase()}`}>{item.status}</span></td><td><div className="generic-row-actions"><button type="button" onClick={() => setScheduleDraft({ ...item })}>✎</button><button type="button" className="delete" onClick={() => removeSchedule(item)}>⌫</button></div></td></tr>)}
      </tbody></table></div>
    </>}

    {tab === 'marks' && <>
      <div className="exam-section-heading"><div><h3>Enter student marks</h3><p>Select a scheduled subject to load the eligible class roster.</p></div></div>
      <div className="exam-mark-filters">
        <label>Exam series<select value={seriesFilter} onChange={event => { setSeriesFilter(event.target.value); setSubjectFilter(''); }}><option value="">Select series</option>{management.series.map(item => <option value={item.id} key={item.id}>{item.academicYear} · {item.name}</option>)}</select></label>
        <label>Class<select value={classFilter} onChange={event => { setClassFilter(event.target.value); setSectionFilter(''); setSubjectFilter(''); }}><option value="">Select class</option>{classes.map(item => <option key={item}>{item}</option>)}</select></label>
        <label>Section<select value={sectionFilter} onChange={event => { setSectionFilter(event.target.value); setSubjectFilter(''); }}><option value="">Select section</option>{sections.map(item => <option key={item}>{item}</option>)}</select></label>
        <label>Subject<select value={subjectFilter} onChange={event => setSubjectFilter(event.target.value)}><option value="">Select scheduled subject</option>{subjects.map(item => <option key={item}>{item}</option>)}</select></label>
      </div>
      <div className="exam-student-table-wrap"><table className="exam-student-table"><thead><tr><th>Student ID</th><th>Student</th><th>Class</th><th>Section</th><th>Marks / 100</th><th>Grade</th><th>Status</th><th>Comments</th></tr></thead><tbody>
        {matchingStudents.length === 0 && <tr><td colSpan={8} className="empty-state">Select a class and section to load students.</td></tr>}
        {matchingStudents.map(student => { const saved = currentMark(student.id); const value = markDrafts[student.id] ?? saved?.marks ?? ''; const numeric = Number(value); return <tr key={student.id}><td>{student.id}</td><td><strong>{student.name}</strong></td><td>{student.className}</td><td>{student.section}</td><td><input className="mark-entry-input" type="number" min="0" max="100" disabled={!subjectFilter} value={value} onChange={event => setMarkDrafts(previous => ({ ...previous, [student.id]: event.target.value }))} /></td><td>{value === '' ? '—' : gradeFor(numeric)}</td><td><span className={`exam-publish-status ${(saved?.status ?? 'Draft').toLowerCase()}`}>{saved?.status ?? 'Draft'}</span></td><td><button type="button" className="comment-result-button" disabled={!seriesFilter || !results.some(item => item.seriesId === seriesFilter && item.studentId === student.id)} onClick={() => openComments(student)}>Add comments</button></td></tr>; })}
      </tbody></table></div>
      <div className="exam-mark-actions"><button type="button" className="secondary" onClick={() => saveMarks(false)}>Save draft</button><button type="button" onClick={() => saveMarks(true)}>Save & publish results</button></div>
    </>}

    {tab === 'results' && <>
      <div className="exam-section-heading"><div><h3>Published results and analysis</h3><p>Review series history, pass rates, and class performance.</p></div></div>
      <div className="exam-analysis-filters">
        <label>Class<select value={classFilter} onChange={event => { setClassFilter(event.target.value); setSectionFilter(''); }}><option value="">Select class</option>{classes.map(item => <option key={item}>{item}</option>)}</select></label>
        <label>Section<select value={sectionFilter} onChange={event => setSectionFilter(event.target.value)}><option value="">Select section</option>{sections.map(item => <option key={item}>{item}</option>)}</select></label>
      </div>
      {(!classFilter || !sectionFilter) && <p className="exam-analysis-hint">Select a class and section to calculate accurate result analysis.</p>}
      <div className="exam-analysis-grid">{management.series.map(series => {
        const seriesMarks = results.filter(item =>
          item.seriesId === series.id &&
          (!classFilter || item.className === classFilter) &&
          (!sectionFilter || item.section === sectionFilter)
        );
        const published = seriesMarks.filter(item => item.status === 'Published');
        const studentIds = new Set(published.map(item => item.studentId));
        const average = published.length ? Math.round(published.reduce((sum, item) => sum + (Number(item.marks) / Number(item.maxMarks ?? 100)) * 100, 0) / published.length) : 0;
        const studentTotals = [...studentIds].map(id => {
          const marks = published.filter(item => item.studentId === id);
          const percentage = marks.length ? marks.reduce((sum, item) => sum + (Number(item.marks) / Number(item.maxMarks ?? 100)) * 100, 0) / marks.length : 0;
          return { id, percentage, passed: marks.length > 0 && marks.every(item => (Number(item.marks) / Number(item.maxMarks ?? 100)) * 100 >= 35) };
        });
        const passRate = studentTotals.length ? Math.round((studentTotals.filter(item => item.passed).length / studentTotals.length) * 100) : 0;
        const topper = [...studentIds].map(id => ({ id, marks: published.filter(item => item.studentId === id).reduce((sum, item) => sum + Number(item.marks), 0) })).sort((a, b) => b.marks - a.marks)[0];
        return <article key={series.id}><span>{series.academicYear} · {classFilter && sectionFilter ? `Class ${classFilter}-${sectionFilter}` : 'Select class & section'}</span><h4>{series.name}</h4><dl><div><dt>Published marks</dt><dd>{published.length}</dd></div><div><dt>Students</dt><dd>{studentIds.size}</dd></div><div><dt>Class average</dt><dd>{average}%</dd></div><div><dt>Pass rate</dt><dd>{passRate}%</dd></div><div><dt>Class topper</dt><dd>{students.find(item => item.id === topper?.id)?.name ?? '—'}</dd></div><div><dt>Top score</dt><dd>{studentTotals.sort((a, b) => b.percentage - a.percentage)[0]?.percentage.toFixed(2) ?? '—'}{studentTotals.length ? '%' : ''}</dd></div></dl></article>;
      })}</div>
    </>}

    {seriesDraft && <div className="generic-item-popup-backdrop" onClick={() => setSeriesDraft(null)}><section className="generic-item-popup exam-config-popup" onClick={event => event.stopPropagation()}><div className="fee-popup-heading"><div><span>Exam series</span><h2>{seriesDraft.name || 'New exam series'}</h2></div><button type="button" onClick={() => setSeriesDraft(null)}>×</button></div><div className="admission-form-grid"><label>Academic year<input value={seriesDraft.academicYear} onChange={event => setSeriesDraft({ ...seriesDraft, academicYear: event.target.value })} /></label><label>Series name<input value={seriesDraft.name} onChange={event => setSeriesDraft({ ...seriesDraft, name: event.target.value })} placeholder="Quarterly Exam" /></label><label>Start date<input type="date" value={seriesDraft.startDate} onChange={event => setSeriesDraft({ ...seriesDraft, startDate: event.target.value })} /></label><label>End date<input type="date" value={seriesDraft.endDate} onChange={event => setSeriesDraft({ ...seriesDraft, endDate: event.target.value })} /></label><label>Status<select value={seriesDraft.status} onChange={event => setSeriesDraft({ ...seriesDraft, status: event.target.value as ExamSeries['status'] })}><option>Draft</option><option>Published</option></select></label></div><div className="admission-form-actions"><button type="button" className="secondary" onClick={() => setSeriesDraft(null)}>Cancel</button><button type="button" onClick={saveSeries}>Save series</button></div></section></div>}

    {scheduleDraft && <div className="generic-item-popup-backdrop" onClick={() => setScheduleDraft(null)}><section className="generic-item-popup exam-config-popup" onClick={event => event.stopPropagation()}><div className="fee-popup-heading"><div><span>Subject schedule</span><h2>{scheduleDraft.subject || 'New schedule'}</h2></div><button type="button" onClick={() => setScheduleDraft(null)}>×</button></div><div className="admission-form-grid"><label>Exam series<select value={scheduleDraft.seriesId} onChange={event => setScheduleDraft({ ...scheduleDraft, seriesId: event.target.value })}><option value="">Select series</option>{management.series.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>Class<input value={scheduleDraft.className} onChange={event => setScheduleDraft({ ...scheduleDraft, className: event.target.value })} /></label><label>Section<input value={scheduleDraft.section} onChange={event => setScheduleDraft({ ...scheduleDraft, section: event.target.value })} /></label><label>Subject<input value={scheduleDraft.subject} onChange={event => setScheduleDraft({ ...scheduleDraft, subject: event.target.value })} /></label><label>Exam date<input type="date" value={scheduleDraft.examDate} onChange={event => setScheduleDraft({ ...scheduleDraft, examDate: event.target.value })} /></label><label>Start time<input type="time" value={scheduleDraft.startTime} onChange={event => setScheduleDraft({ ...scheduleDraft, startTime: event.target.value })} /></label><label>End time<input type="time" value={scheduleDraft.endTime} onChange={event => setScheduleDraft({ ...scheduleDraft, endTime: event.target.value })} /></label><label>Room / hall<input value={scheduleDraft.room} onChange={event => setScheduleDraft({ ...scheduleDraft, room: event.target.value })} /></label><label>Status<select value={scheduleDraft.status} onChange={event => setScheduleDraft({ ...scheduleDraft, status: event.target.value as ExamSchedule['status'] })}><option>Draft</option><option>Published</option></select></label></div><div className="admission-form-actions"><button type="button" className="secondary" onClick={() => setScheduleDraft(null)}>Cancel</button><button type="button" onClick={saveSchedule}>Save schedule</button></div></section></div>}
    {commentStudent && <div className="generic-item-popup-backdrop" onClick={() => setCommentStudent(null)}><section className="generic-item-popup exam-config-popup" onClick={event => event.stopPropagation()}><div className="fee-popup-heading"><div><span>Overall report-card comments</span><h2>{commentStudent.name}</h2><p>{selectedSeries?.name}</p></div><button type="button" onClick={() => setCommentStudent(null)}>×</button></div><div className="admission-form-grid"><label className="wide-field">Class teacher comment<textarea rows={4} value={teacherComment} onChange={event => setTeacherComment(event.target.value)} placeholder="Participation, effort, improvement, conduct…" /></label><label className="wide-field">School comment<textarea rows={4} value={schoolComment} onChange={event => setSchoolComment(event.target.value)} placeholder="Overall performance and promotion remarks…" /></label></div><div className="admission-form-actions"><button type="button" className="secondary" onClick={() => setCommentStudent(null)}>Cancel</button><button type="button" onClick={saveComments}>Save comments</button></div></section></div>}
  </div>;
}
