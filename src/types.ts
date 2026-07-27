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
  subject: string;
  marks: number;
  grade: string;
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
  name: string;
  subject: string;
  email: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  section: string;
  status: string;
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
  fees: FeesInfo;
  messages: string[];
  performance: Metric[];
  announcements: Announcement[];
  achievements: Announcement[];
  events: EventItem[];
  wellness: WellnessItem[];
}
