export interface Metric {
  title: string;
  value: string;
  subtitle: string;
}

export interface AttendanceRecord {
  name: string;
  status: 'Present' | 'Late' | 'Absent' | string;
}

export interface ExamResult {
  id?: string;
  studentId?: string;
  studentName?: string;
  className?: string;
  section?: string;
  examName?: string;
  academicYear?: string;
  seriesId?: string;
  status?: 'Draft' | 'Published';
  subject: string;
  marks: number;
  maxMarks?: number;
  grade: string;
  remarks?: string;
  teacherComment?: string;
  schoolComment?: string;
  rank?: number;
}

export interface ExamSeries {
  id: string;
  academicYear: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Published';
}

export interface ExamSchedule {
  id: string;
  seriesId: string;
  className: string;
  section: string;
  subject: string;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string;
  status: 'Draft' | 'Published';
}

export interface GradeRule {
  id: string;
  label: string;
  minimum: number;
  maximum: number;
}

export interface ExamManagement {
  series: ExamSeries[];
  schedules: ExamSchedule[];
  gradeRules: GradeRule[];
}

export interface FeesInfo {
  due: string;
  paid: string;
  total: string;
  nextInstallment: string;
}

export interface SchoolData {
  name: string;
  address: string;
  code: string;
  principal: string;
  established: number;
  contact: {
    phone: string;
    email: string;
  };
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  upcomingEvents: Array<{ title: string; date: string }>;
}

export interface EventItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  description: string;
  imageUrl: string;
  gallery: string[];
}

export interface Teacher {
  id: string;
  schoolId?: string;
  name: string;
  subject: string;
  specializations: string[];
  email: string;
  assignments: Array<{ className: string; section: string }>;
  duties: string[];
  schedule: TeachingSession[];
  loginId?: string;
  loginEnabled?: boolean;
}

export interface FeeInstallment {
  id: string;
  label: string;
  dueDate: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Overdue' | 'Waived';
  paidDate: string;
  reference: string;
}

export interface StudentFeeAccount {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  joiningDate: string;
  admissionNumber: string;
  academicYear: string;
  totalFee: number;
  discount: number;
  netFee: number;
  installments: FeeInstallment[];
}

export interface AdmissionRecord {
  id: string;
  studentId: string;
  admissionNumber?: string;
  studentName: string;
  dateOfBirth: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  className: string;
  section: string;
  joiningDate: string;
  previousSchool: string;
  status: AdmissionStage;
  enquiryDate?: string;
  enquirySource?: string;
  documents?: Array<{ name: string; status: 'Pending' | 'Uploaded' | 'Verified' }>;
  reviewNotes?: string;
  assessmentRequired?: boolean;
  assessmentType?: 'Entrance Test' | 'Interview' | 'Both';
  assessmentDate?: string;
  assessmentResult?: 'Pending' | 'Passed' | 'Failed' | 'Not required';
  feeStatus?: 'Pending' | 'Partially Paid' | 'Paid' | 'Waived';
  feeReference?: string;
  parentLoginId?: string;
  parentTemporaryPassword?: string;
  studentLoginId?: string;
  studentTemporaryPassword?: string;
  notes: string;
}

export type AdmissionStage =
  | 'Admission Enquiry'
  | 'Online Admission Form'
  | 'Document Upload'
  | 'Admission Review'
  | 'Entrance Test / Interview'
  | 'Admission Approved'
  | 'Fee Payment'
  | 'Student Enrollment'
  | 'Generate Admission Number'
  | 'Generate Student ID'
  | 'Create Parent Account'
  | 'Create Student Login'
  | 'Student Dashboard'
  | 'Rejected';

export interface TeachingSession {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  className: string;
  section: string;
  subject: string;
  room: string;
}

export interface Student {
  id: string;
  schoolId?: string;
  className: string;
  name: string;
  grade: string;
  section: string;
  status: string;
  parentName?: string;
}

export interface SchoolOption {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  branches: BranchOption[];
}

export interface BranchOption {
  id: string;
  schoolId: string;
  code: string;
  name: string;
  address: string;
}

export interface AuthUser {
  id: string;
  name: string;
  role: 'student' | 'parent' | 'teacher' | 'branch_admin' | 'school_admin' | 'global_admin';
  tenantId: string;
  tenantName: string;
  schoolId: string;
  schoolName: string;
  schoolCode: string;
  branchId: string;
  branchName: string;
  branchCode: string;
  student?: Student;
  teacher?: Teacher;
}

export interface StudentFeedback {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  message: string;
  createdAt: string;
  status: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface Announcement {
  title: string;
  date: string;
  imageUrl?: string;
  description?: string;
}

export interface WellnessItem {
  id: string;
  category: 'Parenting' | 'Soft Skills' | 'Wellness Corner';
  title: string;
  description: string;
  date: string;
}

export interface DashboardData {
  summary: Metric[];
  attendance: AttendanceRecord[];
  notifications: string[];
  homework: string[];
  examResults: ExamResult[];
  examManagement?: ExamManagement;
  fees: FeesInfo;
  messages: string[];
  performance: Metric[];
  announcements: Announcement[];
  achievements: Announcement[];
  events: EventItem[];
  wellness: WellnessItem[];
}
