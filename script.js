const attendanceList = document.getElementById('attendance-list');
const notificationList = document.getElementById('notification-list');
const homeworkList = document.getElementById('homework-list');
const examResultsList = document.getElementById('exam-results-list');
const messageList = document.getElementById('message-list');
const performanceSummary = document.getElementById('performance-summary');
const feesSummary = document.getElementById('fees-summary');
const attendancePercent = document.getElementById('attendance-percent');
const homeworkCount = document.getElementById('homework-count');
const notificationCount = document.getElementById('notification-count');
const feesDue = document.getElementById('fees-due');

const homeworkForm = document.getElementById('homework-form');
const homeworkInput = document.getElementById('homework-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

const attendanceData = [
  { name: 'Aisha', status: 'Present' },
  { name: 'Rohan', status: 'Present' },
  { name: 'Mira', status: 'Late' },
  { name: 'Sam', status: 'Absent' },
];

const notifications = [
  'Jay entered school at 8:05 AM',
  'Principal sent a new announcement',
  'Security alert: Transportation update',
  'Mira left school at 3:20 PM',
];

const homeworkUpdates = [
  'Math homework due tomorrow',
  'Science project submission on Friday',
  'English reading assignment posted',
];

const examResults = [
  { subject: 'Math', marks: 88, grade: 'A' },
  { subject: 'Science', marks: 81, grade: 'B+' },
  { subject: 'History', marks: 91, grade: 'A' },
];

const messages = [
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

const feeData = {
  due: '$420',
  paid: '$1,580',
  total: '$2,000',
  nextInstallment: '2026-08-15',
};

function createListItem(text) {
  const li = document.createElement('li');
  li.textContent = text;
  return li;
}

function renderAttendance() {
  attendanceList.innerHTML = '';
  attendanceData.forEach(student => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${student.name}</strong> — ${student.status}`;
    attendanceList.appendChild(li);
  });
}

function renderNotifications() {
  notificationList.innerHTML = '';
  notifications.forEach(note => notificationList.appendChild(createListItem(note)));
}

function renderHomework() {
  homeworkList.innerHTML = '';
  homeworkUpdates.forEach(update => homeworkList.appendChild(createListItem(update)));
  homeworkCount.textContent = homeworkUpdates.length;
}

function renderExamResults() {
  examResultsList.innerHTML = '';
  examResults.forEach(result => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${result.subject}</strong>: ${result.marks} / 100 — ${result.grade}`;
    examResultsList.appendChild(li);
  });
}

function renderMessages() {
  messageList.innerHTML = '';
  messages.forEach(msg => messageList.appendChild(createListItem(msg)));
}

function renderPerformance() {
  performanceSummary.innerHTML = '';
  performanceData.forEach(point => {
    const card = document.createElement('div');
    card.className = 'performance-card';
    card.innerHTML = `<strong>${point.label}</strong><p>${point.value}</p>`;
    performanceSummary.appendChild(card);
  });
}

function renderFees() {
  feesSummary.innerHTML = `
    <p><strong>Total due:</strong> ${feeData.due}</p>
    <p><strong>Paid so far:</strong> ${feeData.paid}</p>
    <p><strong>Total fees:</strong> ${feeData.total}</p>
    <p><strong>Next installment:</strong> ${feeData.nextInstallment}</p>
  `;
  feesDue.textContent = feeData.due;
}

function updateMetrics() {
  attendancePercent.textContent = '92%';
  notificationCount.textContent = notifications.length;
}

homeworkForm.addEventListener('submit', event => {
  event.preventDefault();
  const value = homeworkInput.value.trim();
  if (!value) return;
  homeworkUpdates.unshift(value);
  renderHomework();
  homeworkInput.value = '';
});

messageForm.addEventListener('submit', event => {
  event.preventDefault();
  const value = messageInput.value.trim();
  if (!value) return;
  messages.unshift(value);
  renderMessages();
  messageInput.value = '';
});

window.addEventListener('DOMContentLoaded', () => {
  renderAttendance();
  renderNotifications();
  renderHomework();
  renderExamResults();
  renderMessages();
  renderPerformance();
  renderFees();
  updateMetrics();
});
