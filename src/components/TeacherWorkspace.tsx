import { useEffect, useState } from 'react';
import { fetchFeedback } from '../services/api';
import type { AuthUser, Student, StudentFeedback } from '../types';
import StudentView from './StudentView';

export default function TeacherWorkspace({ user, students }: { user: AuthUser; students: Student[] }) {
  const [feedback, setFeedback] = useState<StudentFeedback[]>([]);
  const [error, setError] = useState('');
  const [scheduleView, setScheduleView] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchFeedback().then(setFeedback).catch(() => setError('Unable to load student feedback.'));
  }, []);

  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const schedule = user.teacher?.schedule ?? [];
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const datedSessions = scheduleView === 'month'
    ? Array.from({ length: new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() }, (_, index) => {
        const date = new Date(today.getFullYear(), today.getMonth(), index + 1);
        return schedule
          .filter(item => item.dayOfWeek === dayNames[date.getDay()])
          .map(item => ({ ...item, date }));
      }).flat()
    : schedule
        .filter(item => scheduleView === 'week' || item.dayOfWeek === dayNames[today.getDay()])
        .map(item => {
          const date = new Date(startOfWeek);
          const dayIndex = Math.max(0, dayNames.indexOf(item.dayOfWeek) - 1);
          date.setDate(startOfWeek.getDate() + dayIndex);
          return { ...item, date };
        });

  return (
    <div className="teacher-workspace">
      <section className="module-card teacher-duty-panel">
        <p className="admin-eyebrow">Teacher workspace</p>
        <h2>{user.teacher?.subject} · Assigned duties</h2>
        <div className="specialization-list">
          {user.teacher?.specializations.map(item => <span key={item}>{item}</span>)}
        </div>
        <div className="duty-grid">
          {user.teacher?.duties.map(duty => <div className="duty-item" key={duty}>{duty}</div>)}
        </div>
      </section>

      <section className="module-card schedule-panel">
        <div className="schedule-heading">
          <div>
            <p className="admin-eyebrow">Teaching timetable</p>
            <h2>Classes you can teach</h2>
            <p>Subject, class, section, time, and room assignments.</p>
          </div>
          <div className="schedule-tabs">
            {(['day', 'week', 'month'] as const).map(view => (
              <button type="button" className={scheduleView === view ? 'active' : ''} onClick={() => setScheduleView(view)} key={view}>
                {view === 'day' ? 'Today' : `This ${view}`}
              </button>
            ))}
          </div>
        </div>
        <div className="schedule-list">
          {datedSessions.length === 0 && <p className="empty-state">No classes scheduled for this period.</p>}
          {datedSessions.map((session, index) => (
            <article key={`${session.id}-${session.date.toISOString()}-${index}`}>
              <div className="schedule-date">
                <strong>{session.date.toLocaleDateString(undefined, { day: '2-digit' })}</strong>
                <span>{session.date.toLocaleDateString(undefined, { month: 'short', weekday: 'short' })}</span>
              </div>
              <div className="schedule-subject"><strong>{session.subject}</strong><span>Class {session.className}-{session.section}</span></div>
              <div className="schedule-meta"><span>{session.startTime}–{session.endTime}</span><span>{session.room}</span></div>
            </article>
          ))}
        </div>
      </section>

      <StudentView students={students} role="teacher" />

      <section className="module-card">
        <div className="feedback-list-heading">
          <div><h2>Student feedback</h2><p>Feedback from students in your assigned classes and sections.</p></div>
          <span>{feedback.length} messages</span>
        </div>
        {error && <p className="feedback-error">{error}</p>}
        <div className="teacher-feedback-list">
          {feedback.length === 0 && <p className="empty-state">No feedback has been submitted by your students.</p>}
          {feedback.map(item => (
            <article key={item.id}>
              <div><strong>{item.studentName}</strong><span>Class {item.className}-{item.section} · {new Date(item.createdAt).toLocaleDateString()}</span></div>
              <p>{item.message}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
