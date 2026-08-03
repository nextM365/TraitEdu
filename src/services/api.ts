import type { AuthSession, AuthUser, DashboardData, SchoolData, SchoolOption, StudentFeedback, Teacher, Student } from '../types';
import { getApiUrl } from '../config/api';

async function fetchJson<T>(path: string): Promise<T> {
  const token = window.localStorage.getItem('traitedu-token');
  const url = getApiUrl(path);
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export function fetchSchools(): Promise<SchoolOption[]> {
  return fetchJson('/api/auth/schools');
}

export async function login(schoolId: string, branchId: string, userId: string, password: string): Promise<AuthSession> {
  const url = getApiUrl('/api/auth/login');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schoolId, branchId, userId, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message ?? 'Unable to sign in.');
  return data;
}

export function fetchCurrentUser(): Promise<AuthUser> {
  return fetchJson('/api/auth/me');
}

export async function logout(): Promise<void> {
  const token = window.localStorage.getItem('traitedu-token');
  if (token) {
    const url = getApiUrl('/api/auth/logout');
    await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }
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

export function fetchAdminContent(): Promise<Record<string, unknown>> {
  return fetchJson('/api/admin/content');
}

export async function updateAdminContent(moduleName: string, content: unknown): Promise<void> {
  const token = window.localStorage.getItem('traitedu-token');
  const url = getApiUrl(`/api/admin/content/${moduleName}`);
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message ?? 'Unable to save content.');
  }
}

export async function updateTeacherAdminContent(
  content: Teacher[],
  credentials: { teacherId: string; loginId: string; password?: string; enabled: boolean },
): Promise<void> {
  const token = window.localStorage.getItem('traitedu-token');
  const url = getApiUrl('/api/admin/content/teachers');
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content, credentials }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message ?? 'Unable to save teacher login.');
  }
}

export function fetchFeedback(): Promise<StudentFeedback[]> {
  return fetchJson('/api/feedback');
}

export async function submitFeedback(message: string): Promise<void> {
  const token = window.localStorage.getItem('traitedu-token');
  const url = getApiUrl('/api/feedback');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message ?? 'Unable to submit feedback.');
  }
}

export interface PlatformHierarchy {
  tenants: Array<{ id: string; name: string }>;
  schools: Array<SchoolData & { id: string; tenantId: string; branches: Array<{ id: string; schoolId: string; code: string; name: string; address: string }> }>;
}

export function fetchPlatformHierarchy(): Promise<PlatformHierarchy> {
  return fetchJson('/api/platform/hierarchy');
}

async function postPlatform<T>(path: string, body: Record<string, string>): Promise<T> {
  const token = window.localStorage.getItem('traitedu-token');
  const response = await fetch(getApiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message ?? 'Unable to save.');
  return data;
}

export function createSchool(body: Record<string, string>) {
  return postPlatform('/api/platform/schools', body);
}

export function createBranch(body: Record<string, string>) {
  return postPlatform('/api/platform/branches', body);
}
