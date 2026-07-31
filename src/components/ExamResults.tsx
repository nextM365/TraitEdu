import { useMemo, useState } from 'react';
import type { AuthUser, ExamManagement, ExamResult, SchoolData } from '../types';

interface ExamResultsProps {
  results: ExamResult[];
  management?: ExamManagement;
  user: AuthUser;
  school: SchoolData | null;
}

export default function ExamResults({ results, management, user, school }: ExamResultsProps) {
  const seriesWithResults = useMemo(() => management?.series.filter(series => results.some(result => result.seriesId === series.id)) ?? [], [management, results]);
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const effectiveSeriesId = selectedSeriesId || seriesWithResults[0]?.id || '';
  const selectedSeries = management?.series.find(series => series.id === effectiveSeriesId);
  const visibleResults = effectiveSeriesId ? results.filter(result => result.seriesId === effectiveSeriesId) : results;
  const schedules = management?.schedules.filter(schedule => schedule.seriesId === effectiveSeriesId) ?? [];
  const obtained = visibleResults.reduce((sum, result) => sum + Number(result.marks), 0);
  const total = visibleResults.reduce((sum, result) => sum + Number(result.maxMarks ?? 100), 0);
  const percentage = total ? (obtained / total) * 100 : 0;
  const passed = visibleResults.length > 0 && visibleResults.every(result => result.grade !== 'Fail' && (Number(result.marks) / Number(result.maxMarks ?? 100)) * 100 >= 35);
  const overallGrade = management?.gradeRules.find(rule => percentage >= rule.minimum && percentage <= rule.maximum)?.label
    ?? (percentage >= 91 ? 'A+' : percentage >= 81 ? 'A' : percentage >= 71 ? 'B+' : percentage >= 61 ? 'B' : percentage >= 51 ? 'C' : percentage >= 35 ? 'D' : 'Fail');
  const teacherComment = visibleResults.find(result => result.teacherComment)?.teacherComment;
  const schoolComment = visibleResults.find(result => result.schoolComment)?.schoolComment;
  const rank = visibleResults.find(result => result.rank)?.rank;

  return <div className="student-exam-module">
    <div className="card-header"><div><h2>Examinations</h2><p>Published schedules and result history for your class and section.</p></div>
      {seriesWithResults.length > 0 && <select value={effectiveSeriesId} onChange={event => setSelectedSeriesId(event.target.value)}>{seriesWithResults.map(series => <option value={series.id} key={series.id}>{series.academicYear} · {series.name}</option>)}</select>}
    </div>

    {management && management.schedules.length > 0 && <section className="student-exam-card">
      <h3>Published exam schedule</h3>
      <div className="student-exam-table-wrap"><table className="student-exam-table"><thead><tr><th>Exam series</th><th>Subject</th><th>Date</th><th>Time</th><th>Room</th></tr></thead><tbody>
        {management.schedules.map(schedule => <tr key={schedule.id}><td>{management.series.find(series => series.id === schedule.seriesId)?.name}</td><td><strong>{schedule.subject}</strong></td><td>{new Date(`${schedule.examDate}T00:00:00`).toLocaleDateString()}</td><td>{schedule.startTime}–{schedule.endTime}</td><td>{schedule.room}</td></tr>)}
      </tbody></table></div>
    </section>}

    <section className="student-exam-card printable-report">
      <div className="report-card-heading">
        <div><span>{school?.name ?? user.schoolName}</span><h3>{selectedSeries?.name ?? 'Examination results'}</h3><p>{selectedSeries?.academicYear ?? visibleResults[0]?.academicYear}</p></div>
        {visibleResults.length > 0 && <button type="button" className="download-report-button no-print" onClick={() => window.print()}>Download / Print report card</button>}
      </div>
      {visibleResults.length > 0 && <div className="report-student-details"><div><span>Student</span><strong>{user.name}</strong></div><div><span>Student ID</span><strong>{user.student?.id ?? user.id}</strong></div><div><span>Class & section</span><strong>{user.student?.className}-{user.student?.section}</strong></div><div><span>Exam series</span><strong>{selectedSeries?.name ?? visibleResults[0]?.examName}</strong></div></div>}
      {visibleResults.length === 0 ? <p className="empty-state">No published results are available yet.</p> : <>
        <div className="student-exam-table-wrap"><table className="student-exam-table"><thead><tr><th>Subject</th><th>Marks</th><th>Maximum</th><th>Grade</th><th>Remarks</th></tr></thead><tbody>
          {visibleResults.map((result, index) => <tr key={result.id ?? `${result.subject}-${index}`}><td><strong>{result.subject}</strong></td><td>{result.marks}</td><td>{result.maxMarks ?? 100}</td><td><span className="result-grade">{result.grade}</span></td><td>{result.remarks || '—'}</td></tr>)}
        </tbody></table></div>
        <div className="student-result-summary"><div><span>Total marks</span><strong>{total}</strong></div><div><span>Obtained</span><strong>{obtained}</strong></div><div><span>Average / Percentage</span><strong>{percentage.toFixed(2)}%</strong></div><div><span>Overall grade</span><strong>{overallGrade}</strong></div><div><span>Result</span><strong className={passed ? 'pass' : 'fail'}>{passed ? 'PASS' : 'FAIL'}</strong></div>{rank && <div><span>Rank</span><strong>{rank}</strong></div>}</div>
        <div className="report-comments"><div><span>Class teacher’s comment</span><p>{teacherComment || 'No class teacher comment has been published.'}</p></div><div><span>School comment</span><p>{schoolComment || 'No school comment has been published.'}</p></div></div>
        <div className="report-signatures"><div>Class Teacher</div><div>Principal</div></div>
      </>}
    </section>
  </div>;
}
