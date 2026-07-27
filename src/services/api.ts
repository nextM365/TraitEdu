import type { DashboardData, SchoolData, Teacher, Student } from '../types';

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export function fetchDashboard(): Promise<DashboardData> {
  return fetchJson('/api/dashboard');
}

export function fetchSchool(): Promise<SchoolData> {
  return fetchJson('/api/school');
}

export function fetchTeachers(): Promise<Teacher[]> {
  return fetchJson('/api/teachers');
}

export function fetchStudents(): Promise<Student[]> {
  return fetchJson('/api/students');
}
