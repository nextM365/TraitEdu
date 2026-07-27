import { useMemo, useState } from 'react';
import type { AttendanceRecord } from '../types';

interface AttendanceProps {
  students: AttendanceRecord[];
  onViewDetails?: () => void;
  onBack?: () => void;
}

export default function Attendance({ students, onViewDetails, onBack }: AttendanceProps) {
  const [activeTab, setActiveTab] = useState<'class' | 'exam'>('exam');

  const { presentCount, absentCount } = useMemo(() => {
    const present = students.filter(student => student.status === 'Present').length;
    const absent = students.filter(student => student.status === 'Absent').length;
    return { presentCount: present, absentCount: absent };
  }, [students]);

  const attendanceCalendar = [
    ['28', '29', '30', '1', '2', '3', '4'],
    ['5', '6', '7', '8', '9', '10', '11'],
    ['12', '13', '14', '15', '16', '17', '18'],
    ['19', '20', '21', '22', '23', '24', '25'],
    ['26', '27', '28', '29', '30', '31', '1'],
  ];

  const dayStatus: Record<string, string> = {
    '5': 'present',
    '12': 'present',
    '19': 'present',
    '20': 'absent',
    '26': 'present',
    '27': 'holiday',
    '11': 'selected',
  };

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        {onBack && (
          <button type="button" className="back-button" onClick={onBack}>
            ←
          </button>
        )}
        <h1>Attendance</h1>
      </div>

      <div className="attendance-tabs">
        <button
          type="button"
          className={activeTab === 'class' ? 'attendance-tab active' : 'attendance-tab'}
          onClick={() => setActiveTab('class')}>
          Class
        </button>
        <button
          type="button"
          className={activeTab === 'exam' ? 'attendance-tab active' : 'attendance-tab'}
          onClick={() => setActiveTab('exam')}>
          Exam
        </button>
      </div>

      {activeTab === 'exam' ? (
        <div className="attendance-exam-view">
          <div className="attendance-summary-card">
            <div className="attendance-summary-header">
              <div>
                <p className="attendance-summary-title">TOTAL EXAMS CONDUCTED</p>
                <h2>0</h2>
              </div>
              <div className="attendance-term-select">'26 - '27</div>
            </div>

            <div className="attendance-chart-placeholder">No Data to show Chart</div>

            <div className="attendance-status-row">
              <div className="attendance-status-item">
                <span className="status-dot present"></span>
                <span>Present</span>
                <strong>{presentCount} exams</strong>
              </div>
              <div className="attendance-status-item">
                <span className="status-dot absent"></span>
                <span>Absent</span>
                <strong>{absentCount} exams</strong>
              </div>
            </div>

            {onViewDetails && (
              <button type="button" className="attendance-details-button" onClick={onViewDetails}>
                View Details &gt;
              </button>
            )}
          </div>

          <div className="attendance-secondary-card">
            <h3>Recently Missed Exams</h3>
            <p>No Data to be Displayed</p>
          </div>
        </div>
      ) : (
        <div className="attendance-class-view">
          <div className="attendance-month-card">
            <div className="attendance-month-labels">
              <h2>Month Wise Summary</h2>
            </div>
            <div className="attendance-month-picker">
              <div><span>'26</span><strong>Apr</strong></div>
              <div><span>'26</span><strong>May</strong></div>
              <div><span>'26</span><strong>Jun</strong></div>
              <div className="selected-month"><span>'26</span><strong>Jul</strong></div>
            </div>
            <div className="attendance-calendar">
              <div className="calendar-row calendar-headings">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(label => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              {attendanceCalendar.map((week, index) => (
                <div key={index} className="calendar-row">
                  {week.map(day => (
                    <span key={day} className={`calendar-day ${dayStatus[day] || ''}`}>
                      {day}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="attendance-summary-list">
            <div className="attendance-summary-item">
              <p>Month of <strong>July</strong></p>
              <span>2026</span>
            </div>
            <div className="attendance-summary-item">
              <p>Working Days</p>
              <strong>22 days</strong>
            </div>
            <div className="attendance-summary-status-grid">
              <div className="attendance-summary-badge present">
                <span></span>
                <div>
                  <p>Present</p>
                  <strong>21 days</strong>
                </div>
              </div>
              <div className="attendance-summary-badge absent">
                <span></span>
                <div>
                  <p>Absent</p>
                  <strong>1 days</strong>
                </div>
              </div>
              <div className="attendance-summary-badge muted">
                <span></span>
                <div>
                  <p>Not Updated</p>
                  <strong>0 days</strong>
                </div>
              </div>
              <div className="attendance-summary-badge holiday">
                <span></span>
                <div>
                  <p>Holiday / Non-Working</p>
                  <strong>5 days</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
