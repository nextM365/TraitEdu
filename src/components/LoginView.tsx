import { useEffect, useState, type FormEvent } from 'react';
import { fetchSchools, login } from '../services/api';
import type { AuthSession, SchoolOption } from '../types';

export default function LoginView({ onLogin }: { onLogin: (session: AuthSession) => void }) {
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [schoolId, setSchoolId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverAvailable, setServerAvailable] = useState(true);

  useEffect(() => {
    fetchSchools().then(items => {
      if (items.length) {
        setSchools(items);
        setSchoolId(current => items.some(item => item.id === current) ? current : items[0].id);
        setBranchId(current => items.some(item => item.branches.some(branch => branch.id === current)) ? current : items[0].branches[0]?.id ?? '');
      }
      setServerAvailable(true);
    }).catch(() => {
      setServerAvailable(false);
      setError('The database-backed school service is offline. Start the app, then refresh this page.');
    });
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      onLogin(await login(schoolId, branchId, userId, password));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to sign in.';
      setError(message === 'Failed to fetch'
        ? 'The school server is offline. Start the app with “npm run dev”, then try again.'
        : message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <span className="brand-mark">T</span>
          <div><h1>TraitEdu</h1><p>One secure space for every school community.</p></div>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <label>School
            <select value={schoolId} onChange={event => {
              const nextSchoolId = event.target.value;
              setSchoolId(nextSchoolId);
              setBranchId(schools.find(item => item.id === nextSchoolId)?.branches[0]?.id ?? '');
            }} required>
              {schools.map(item => <option key={item.id} value={item.id}>{item.name} · {item.code}</option>)}
            </select>
          </label>
          <label>Branch
            <select value={branchId} onChange={event => setBranchId(event.target.value)} required>
              {schools.find(item => item.id === schoolId)?.branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name} · {branch.code}</option>)}
            </select>
          </label>
          <label>Student or admin ID
            <input value={userId} onChange={event => setUserId(event.target.value)} placeholder="Enter your ID" required />
          </label>
          <label>Password
            <input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" required />
          </label>
          {error && <p className="login-error" role="alert">{error}</p>}
          {!serverAvailable && <p className="server-status">School and branch options are loaded only from PostgreSQL.</p>}
          <button type="submit" disabled={submitting || !schoolId || !branchId}>{submitting ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <div className="demo-accounts">
          <strong>Demo accounts</strong>
          <span>Student: 5996024 / student123</span>
          <span>School admin: admin / admin123</span>
          <span>Global admin: superadmin / global123</span>
          <span>Teacher: T1001 / teacher123</span>
        </div>
      </section>
    </main>
  );
}
