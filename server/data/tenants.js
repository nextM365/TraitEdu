import dashboardData from './dashboardData.js';

const tenants = [
  { id: 'traitedu', name: 'TraitEdu Education Network' },
];

const schools = [
  {
    id: 'echamps',
    tenantId: 'traitedu',
    code: 'E-CHAMPS-1',
    name: 'E-CHAMPS Public School',
    address: '123 Campus Avenue, Hyderabad',
    principal: 'Dr. Kavya Reddy',
    established: 2010,
    contact: { phone: '+91 90000 12345', email: 'info@echamps.school' },
    totalStudents: 1425,
    totalTeachers: 86,
    totalClasses: 68,
    upcomingEvents: [
      { title: 'Annual Sports Day', date: '2026-08-20' },
      { title: 'Parent Teacher Meeting', date: '2026-09-04' },
    ],
  },
  {
    id: 'greenfield',
    tenantId: 'traitedu',
    code: 'GREEN-2',
    name: 'Greenfield Academy',
    address: '45 Lake Road, Bengaluru',
    principal: 'Mrs. Meera Iyer',
    established: 2016,
    contact: { phone: '+91 90000 67890', email: 'hello@greenfield.school' },
    totalStudents: 860,
    totalTeachers: 54,
    totalClasses: 42,
    upcomingEvents: [
      { title: 'Science Exhibition', date: '2026-08-28' },
      { title: 'Parent Teacher Meeting', date: '2026-09-11' },
    ],
  },
];

const branches = [
  { id: 'echamps-main', schoolId: 'echamps', code: 'ECH-MAIN', name: 'E-CHAMPS Main Campus', address: '123 Campus Avenue, Hyderabad' },
  { id: 'echamps-north', schoolId: 'echamps', code: 'ECH-NORTH', name: 'E-CHAMPS North Campus', address: '18 North Avenue, Hyderabad' },
  { id: 'greenfield-central', schoolId: 'greenfield', code: 'GF-CENTRAL', name: 'Greenfield Central Campus', address: '45 Lake Road, Bengaluru' },
  { id: 'greenfield-east', schoolId: 'greenfield', code: 'GF-EAST', name: 'Greenfield East Campus', address: '12 Whitefield Road, Bengaluru' },
];

const students = [
  { id: '5996024', schoolId: 'echamps', className: '10', section: 'A', name: 'Jyohan Naidu Girinadhuni', grade: '10', status: 'Active', parentName: 'G Mallikarjuna' },
  { id: '5996025', schoolId: 'echamps', className: '10', section: 'A', name: 'Aisha Kumar', grade: '10', status: 'Present', parentName: 'Ravi Kumar' },
  { id: '5996026', schoolId: 'echamps', className: '10', section: 'B', name: 'Rohan Patel', grade: '10', status: 'Present', parentName: 'Amit Patel' },
  { id: 'GF1001', schoolId: 'greenfield', className: '8', section: 'B', name: 'Ananya Rao', grade: '8', status: 'Active', parentName: 'Kiran Rao' },
  { id: 'GF1002', schoolId: 'greenfield', className: '9', section: 'A', name: 'Kabir Singh', grade: '9', status: 'Present', parentName: 'Priya Singh' },
];

const teachers = [
  {
    id: 'T1001', schoolId: 'echamps', name: 'Mrs. Anjali Sharma', subject: 'Mathematics',
    specializations: ['Mathematics', 'General Knowledge'], email: 'anjali.sharma@echamps.school',
    assignments: [{ className: '10', section: 'A' }, { className: '10', section: 'B' }],
    duties: ['Class teacher — 10 A', 'Morning assembly — Monday', 'Mathematics lab coordinator'],
    schedule: [
      { id: 's1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '09:45', className: '10', section: 'A', subject: 'Mathematics', room: '10-A' },
      { id: 's2', dayOfWeek: 'Monday', startTime: '11:00', endTime: '11:45', className: '10', section: 'B', subject: 'Mathematics', room: '10-B' },
      { id: 's3', dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '10:45', className: '10', section: 'A', subject: 'General Knowledge', room: '10-A' },
      { id: 's4', dayOfWeek: 'Wednesday', startTime: '09:00', endTime: '09:45', className: '10', section: 'B', subject: 'Mathematics', room: '10-B' },
      { id: 's5', dayOfWeek: 'Thursday', startTime: '12:00', endTime: '12:45', className: '10', section: 'A', subject: 'Mathematics', room: 'Math Lab' },
      { id: 's6', dayOfWeek: 'Friday', startTime: '10:00', endTime: '10:45', className: '10', section: 'B', subject: 'General Knowledge', room: '10-B' },
    ],
  },
  {
    id: 'T1002', schoolId: 'echamps', name: 'Mr. Aditya Rao', subject: 'Science',
    specializations: ['Science', 'Physical Training'], email: 'aditya.rao@echamps.school',
    assignments: [{ className: '10', section: 'B' }], duties: ['Class teacher — 10 B', 'Science club coordinator'],
    schedule: [
      { id: 's7', dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '09:45', className: '10', section: 'B', subject: 'Science', room: 'Science Lab' },
      { id: 's8', dayOfWeek: 'Friday', startTime: '14:00', endTime: '14:45', className: '10', section: 'B', subject: 'Physical Training', room: 'Playground' },
    ],
  },
  {
    id: 'T1003', schoolId: 'echamps', name: 'Ms. Kavitha Reddy', subject: 'Languages',
    specializations: ['Language 1 — English', 'Language 2 — Hindi', 'Social Studies'], email: 'kavitha.reddy@echamps.school',
    assignments: [{ className: '10', section: 'A' }, { className: '10', section: 'B' }], duties: ['Language department coordinator'],
    schedule: [
      { id: 's9', dayOfWeek: 'Monday', startTime: '10:00', endTime: '10:45', className: '10', section: 'A', subject: 'Language 1 — English', room: '10-A' },
      { id: 's10', dayOfWeek: 'Wednesday', startTime: '11:00', endTime: '11:45', className: '10', section: 'B', subject: 'Language 2 — Hindi', room: '10-B' },
      { id: 's11', dayOfWeek: 'Thursday', startTime: '09:00', endTime: '09:45', className: '10', section: 'A', subject: 'Social Studies', room: '10-A' },
    ],
  },
  {
    id: 'GT101', schoolId: 'greenfield', name: 'Ms. Nisha Menon', subject: 'Mathematics',
    specializations: ['Mathematics', 'General Knowledge'], email: 'nisha@greenfield.school',
    assignments: [{ className: '8', section: 'B' }], duties: ['Class teacher — 8 B', 'Examination committee'],
    schedule: [{ id: 'gs1', dayOfWeek: 'Monday', startTime: '09:00', endTime: '09:45', className: '8', section: 'B', subject: 'Mathematics', room: '8-B' }],
  },
  {
    id: 'GT102', schoolId: 'greenfield', name: 'Mr. Arjun Das', subject: 'Science',
    specializations: ['Science', 'Physical Training'], email: 'arjun@greenfield.school',
    assignments: [{ className: '9', section: 'A' }], duties: ['Class teacher — 9 A', 'Science laboratory supervisor'],
    schedule: [{ id: 'gs2', dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '10:45', className: '9', section: 'A', subject: 'Science', room: 'Science Lab' }],
  },
];

const users = [
  { id: '5996024', password: 'student123', role: 'student', schoolId: 'echamps', studentId: '5996024' },
  { id: 'GF1001', password: 'student123', role: 'student', schoolId: 'greenfield', studentId: 'GF1001' },
  { id: 'T1001', password: 'teacher123', role: 'teacher', schoolId: 'echamps', teacherId: 'T1001' },
  { id: 'GT101', password: 'teacher123', role: 'teacher', schoolId: 'greenfield', teacherId: 'GT101' },
  { id: 'admin', password: 'admin123', role: 'school_admin', schoolId: 'echamps', name: 'E-CHAMPS Administrator' },
  { id: 'admin', password: 'admin123', role: 'school_admin', schoolId: 'greenfield', name: 'Greenfield Administrator' },
];

students.forEach(student => {
  student.branchId = student.schoolId === 'echamps' ? 'echamps-main' : 'greenfield-central';
});
teachers.forEach(teacher => {
  teacher.branchId = teacher.schoolId === 'echamps' ? 'echamps-main' : 'greenfield-central';
});
users.forEach(user => {
  user.branchId = user.schoolId === 'echamps' ? 'echamps-main' : 'greenfield-central';
});
users.forEach(user => {
  if (user.role === 'school_admin') user.role = 'branch_admin';
});
users.push(
  { id: 'admin', password: 'admin123', role: 'branch_admin', schoolId: 'echamps', branchId: 'echamps-north', name: 'E-CHAMPS North Administrator' },
  { id: 'admin', password: 'admin123', role: 'branch_admin', schoolId: 'greenfield', branchId: 'greenfield-east', name: 'Greenfield East Administrator' },
  { id: 'superadmin', password: 'global123', role: 'global_admin', tenantId: 'traitedu', name: 'TraitEdu Global Administrator' },
);

const managedContentDefaults = {
  announcements: dashboardData.announcements,
  achievements: dashboardData.achievements,
  examResults: dashboardData.examResults,
  examManagement: {
    series: [
      { id: 'series-quarterly-2026', academicYear: '2026-27', name: 'Quarterly Exam', startDate: '2026-09-10', endDate: '2026-09-17', status: 'Published' },
    ],
    schedules: [
      { id: 'schedule-q-english', seriesId: 'series-quarterly-2026', className: '10', section: 'A', subject: 'English', examDate: '2026-09-10', startTime: '09:30', endTime: '11:30', room: 'Hall A', status: 'Published' },
      { id: 'schedule-q-maths', seriesId: 'series-quarterly-2026', className: '10', section: 'A', subject: 'Mathematics', examDate: '2026-09-12', startTime: '09:30', endTime: '11:30', room: 'Hall A', status: 'Published' },
      { id: 'schedule-q-science', seriesId: 'series-quarterly-2026', className: '10', section: 'A', subject: 'Science', examDate: '2026-09-15', startTime: '09:30', endTime: '11:30', room: 'Hall A', status: 'Published' },
    ],
    gradeRules: [
      { id: 'grade-a-plus', label: 'A+', minimum: 91, maximum: 100 },
      { id: 'grade-a', label: 'A', minimum: 81, maximum: 90 },
      { id: 'grade-b-plus', label: 'B+', minimum: 71, maximum: 80 },
      { id: 'grade-b', label: 'B', minimum: 61, maximum: 70 },
      { id: 'grade-c', label: 'C', minimum: 51, maximum: 60 },
      { id: 'grade-d', label: 'D', minimum: 35, maximum: 50 },
      { id: 'grade-fail', label: 'Fail', minimum: 0, maximum: 34 },
    ],
  },
  attendance: dashboardData.attendance,
  opinionPolls: [{ id: 'poll-1', title: 'Preferred activity club', status: 'Open' }],
  parentConcerns: [],
  busTracking: { enabled: true, provider: 'TraitEdu Transport', supportPhone: '+91 90000 12345' },
  wellness: dashboardData.wellness,
  gatePass: { enabled: true, approvalRequired: true },
  events: dashboardData.events,
  admissions: [
    {
      id: 'admission-demo-1',
      studentId: 'NEW1001',
      studentName: 'Demo Applicant',
      dateOfBirth: '2016-04-18',
      parentName: 'Demo Parent',
      parentPhone: '+91 90000 11111',
      parentEmail: 'parent@example.com',
      className: '5',
      section: 'A',
      joiningDate: '2026-08-03',
      previousSchool: 'Sunrise Primary School',
      status: 'Online Admission Form',
      admissionNumber: '',
      enquiryDate: '2026-07-25',
      enquirySource: 'Website',
      documents: [
        { name: 'Birth certificate', status: 'Uploaded' },
        { name: 'Student photograph', status: 'Uploaded' },
        { name: 'Parent ID proof', status: 'Pending' },
        { name: 'Address proof', status: 'Pending' },
        { name: 'Previous school records', status: 'Pending' },
      ],
      reviewNotes: '',
      assessmentRequired: false,
      assessmentType: 'Entrance Test',
      assessmentDate: '',
      assessmentResult: 'Not required',
      feeStatus: 'Pending',
      feeReference: '',
      parentLoginId: '',
      parentTemporaryPassword: '',
      studentLoginId: '',
      studentTemporaryPassword: '',
      notes: '',
    },
  ],
};

function createFeeAccounts(branchId) {
  return students.filter(student => student.branchId === branchId).map((student, index) => {
    const totalFee = index % 2 === 0 ? 120000 : 105000;
    const discount = index === 0 ? 5000 : 0;
    const netFee = totalFee - discount;
    const firstAmount = Math.round(netFee / 3);
    return {
      id: `fee-${student.id}`,
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      section: student.section,
      joiningDate: index === 0 ? '2024-06-10' : '2025-06-09',
      admissionNumber: `ADM-${student.id}`,
      academicYear: '2026-27',
      totalFee,
      discount,
      netFee,
      installments: [
        { id: `inst-${student.id}-1`, label: 'Installment 1', dueDate: '2026-06-15', amount: firstAmount, status: 'Paid', paidDate: '2026-06-12', reference: `PAY-${student.id}-01` },
        { id: `inst-${student.id}-2`, label: 'Installment 2', dueDate: '2026-09-15', amount: firstAmount, status: 'Pending', paidDate: '', reference: '' },
        { id: `inst-${student.id}-3`, label: 'Installment 3', dueDate: '2026-12-15', amount: netFee - firstAmount * 2, status: 'Pending', paidDate: '', reference: '' },
      ],
    };
  });
}

const branchContent = new Map(
  branches.map(branch => [branch.id, {
    ...structuredClone(managedContentDefaults),
    fees: createFeeAccounts(branch.id),
    teachers: structuredClone(teachers.filter(teacher => teacher.branchId === branch.id)),
    studentFeedback: [],
  }])
);

function getBranchContent(branchId) {
  return branchContent.get(branchId);
}

function initializeBranchContent(branchId) {
  if (!branchContent.has(branchId)) {
    branchContent.set(branchId, {
      ...structuredClone(managedContentDefaults),
      fees: [],
      teachers: [],
      studentFeedback: [],
    });
  }
  return branchContent.get(branchId);
}

export { tenants, schools, branches, students, teachers, users, dashboardData, getBranchContent, initializeBranchContent };
