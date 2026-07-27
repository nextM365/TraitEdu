import SummaryComponent from './components/SummaryComponent.js';
import AttendanceComponent from './components/AttendanceComponent.js';
import NotificationsComponent from './components/NotificationsComponent.js';
import HomeworkComponent from './components/HomeworkComponent.js';
import ExamResultsComponent from './components/ExamResultsComponent.js';
import FeesComponent from './components/FeesComponent.js';
import CommunicationComponent from './components/CommunicationComponent.js';
import PerformanceComponent from './components/PerformanceComponent.js';

const summaryRoot = document.getElementById('summary-root');
const attendanceRoot = document.getElementById('attendance-root');
const notificationsRoot = document.getElementById('notifications-root');
const homeworkRoot = document.getElementById('homework-root');
const examResultsRoot = document.getElementById('exam-results-root');
const feesRoot = document.getElementById('fees-root');
const communicationRoot = document.getElementById('communication-root');
const performanceRoot = document.getElementById('performance-root');

const summaryData = [
  { title: 'Attendance', value: '92%', subtitle: 'Presence rate today' },
  { title: 'Homework', value: '3', subtitle: 'Pending tasks' },
  { title: 'Notifications', value: '4', subtitle: 'Unread alerts' },
  { title: 'Fees', value: '$420', subtitle: 'Due balance' },
];

const attendanceData = [
  { name: 'Aisha', status: 'Present' },
  { name: 'Rohan', status: 'Present' },
  { name: 'Mira', status: 'Late' },
  { name: 'Sam', status: 'Absent' },
];

const notificationsData = [
  'Jay entered school at 8:05 AM',
  'Principal sent a new announcement',
  'Security alert: Transportation update',
  'Mira left school at 3:20 PM',
];

const homeworkData = [
  'Math homework due tomorrow',
  'Science project submission on Friday',
  'English reading assignment posted',
];

const examResultsData = [
  { subject: 'Math', marks: 88, grade: 'A' },
  { subject: 'Science', marks: 81, grade: 'B+' },
  { subject: 'History', marks: 91, grade: 'A' },
];

const feesData = {
  due: '$420',
  paid: '$1,580',
  total: '$2,000',
  nextInstallment: '2026-08-15',
};

const messagesData = [
  'Parent requested meeting for student progress',
  'Teacher submitted weekly report',
  'School announced holiday next week',
];

const performanceData = [
  { label: 'GPA', value: '3.8 / 4.0' },
  { label: 'Attendance', value: '92%' },
  { label: 'Assignments Completed', value: '87%' },
  { label: 'Behavior Rating', value: 'Excellent' },
];

window.addEventListener('DOMContentLoaded', () => {
  const summary = new SummaryComponent(summaryRoot, summaryData);
  const attendance = new AttendanceComponent(attendanceRoot, attendanceData);
  const notifications = new NotificationsComponent(notificationsRoot, notificationsData);
  const homework = new HomeworkComponent(homeworkRoot, homeworkData);
  const examResults = new ExamResultsComponent(examResultsRoot, examResultsData);
  const fees = new FeesComponent(feesRoot, feesData);
  const communication = new CommunicationComponent(communicationRoot, messagesData);
  const performance = new PerformanceComponent(performanceRoot, performanceData);

  summary.render();
  attendance.render();
  notifications.render();
  homework.render();
  examResults.render();
  fees.render();
  communication.render();
  performance.render();
});
