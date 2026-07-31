import { useEffect, useState } from 'react';
import { createBranch, createSchool, fetchPlatformHierarchy, type PlatformHierarchy } from '../services/api';

type FormMode = 'school' | 'branch' | null;

export default function GlobalAdminManager() {
  const [hierarchy, setHierarchy] = useState<PlatformHierarchy | null>(null);
  const [mode, setMode] = useState<FormMode>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  function load() {
    fetchPlatformHierarchy().then(setHierarchy).catch(error => setMessage(error instanceof Error ? error.message : 'Unable to load hierarchy.'));
  }
  useEffect(load, []);

  function open(modeValue: Exclude<FormMode, null>) {
    setMode(modeValue);
    setMessage('');
    setForm(modeValue === 'school'
      ? { id: '', name: '', code: '', address: '', principal: '', contactEmail: '', contactPhone: '' }
      : { id: '', schoolId: hierarchy?.schools[0]?.id ?? '', name: '', code: '', address: '' });
  }

  async function save() {
    try {
      if (mode === 'school') await createSchool(form);
      if (mode === 'branch') await createBranch(form);
      setMode(null);
      load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save.');
    }
  }

  if (!hierarchy) return <section className="module-card">{message || 'Loading organization hierarchy…'}</section>;

  return (
    <section className="global-admin-workspace">
      <div className="global-admin-heading">
        <div><p className="admin-eyebrow">Platform administration</p><h2>{hierarchy.tenants[0]?.name}</h2><p>Manage schools and their branches across the tenant.</p></div>
        <div><button type="button" onClick={() => open('school')}>+ Add School</button><button type="button" onClick={() => open('branch')}>+ Add Branch</button></div>
      </div>
      <div className="hierarchy-stats">
        <div><strong>{hierarchy.schools.length}</strong><span>Schools</span></div>
        <div><strong>{hierarchy.schools.reduce((sum, school) => sum + school.branches.length, 0)}</strong><span>Branches</span></div>
      </div>
      <div className="hierarchy-table-wrap">
        <table className="hierarchy-table">
          <thead><tr><th>School</th><th>School code</th><th>Principal</th><th>Branch</th><th>Branch code</th><th>Branch address</th></tr></thead>
          <tbody>{hierarchy.schools.flatMap(school =>
            school.branches.length ? school.branches.map((branch, index) => <tr key={branch.id}>
              <td>{index === 0 && <strong>{school.name}</strong>}</td><td>{index === 0 ? school.code : ''}</td><td>{index === 0 ? school.principal : ''}</td>
              <td><strong>{branch.name}</strong></td><td>{branch.code}</td><td>{branch.address}</td>
            </tr>) : [<tr key={school.id}><td><strong>{school.name}</strong></td><td>{school.code}</td><td>{school.principal}</td><td colSpan={3}>No branches</td></tr>]
          )}</tbody>
        </table>
      </div>

      {mode && <div className="platform-popup-backdrop" onClick={() => setMode(null)}>
        <section className="platform-popup" onClick={event => event.stopPropagation()}>
          <div className="fee-popup-heading"><div><span>Global administration</span><h2>{mode === 'school' ? 'Add School' : 'Add Branch'}</h2></div><button type="button" onClick={() => setMode(null)}>×</button></div>
          <div className="platform-form-grid">
            {mode === 'branch' && <label>School<select value={form.schoolId} onChange={event => setForm({ ...form, schoolId: event.target.value })}>{hierarchy.schools.map(school => <option key={school.id} value={school.id}>{school.name}</option>)}</select></label>}
            <label>{mode === 'school' ? 'School ID' : 'Branch ID'}<input value={form.id} onChange={event => setForm({ ...form, id: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} placeholder="unique-id" /></label>
            <label>Name<input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label>
            <label>Code<input value={form.code} onChange={event => setForm({ ...form, code: event.target.value.toUpperCase() })} /></label>
            <label className="wide-field">Address<input value={form.address} onChange={event => setForm({ ...form, address: event.target.value })} /></label>
            {mode === 'school' && <><label>Principal<input value={form.principal} onChange={event => setForm({ ...form, principal: event.target.value })} /></label><label>Contact email<input type="email" value={form.contactEmail} onChange={event => setForm({ ...form, contactEmail: event.target.value })} /></label><label>Contact phone<input value={form.contactPhone} onChange={event => setForm({ ...form, contactPhone: event.target.value })} /></label></>}
          </div>
          {message && <p className="feedback-error">{message}</p>}
          <div className="admission-form-actions"><button type="button" className="secondary" onClick={() => setMode(null)}>Cancel</button><button type="button" onClick={save}>Save {mode}</button></div>
        </section>
      </div>}
    </section>
  );
}
