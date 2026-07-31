import { useEffect, useMemo, useState } from 'react';
import { updateAdminContent } from '../services/api';
import type { FeeInstallment, Student, StudentFeeAccount } from '../types';

const makeId = (prefix: string) => globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random()}`;
const money = (value: number) => `₹${Number(value).toLocaleString('en-IN')}`;

function emptyInstallment(): FeeInstallment {
  return { id: makeId('installment'), label: '', dueDate: '', amount: 0, status: 'Pending', paidDate: '', reference: '' };
}

function emptyAccount(): StudentFeeAccount {
  return { id: makeId('fee'), studentId: '', studentName: '', className: '', section: '', joiningDate: '', admissionNumber: '', academicYear: '2026-27', totalFee: 0, discount: 0, netFee: 0, installments: [emptyInstallment()] };
}

export default function FeeManagementForm({ accounts, students, onSaved }: {
  accounts: StudentFeeAccount[];
  students: Student[];
  onSaved: (accounts: StudentFeeAccount[]) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [draft, setDraft] = useState<StudentFeeAccount>(emptyAccount());
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');

  useEffect(() => {
    setDraft(selectedIndex >= 0 && accounts[selectedIndex] ? structuredClone(accounts[selectedIndex]) : emptyAccount());
    setMessage('');
  }, [selectedIndex, accounts]);

  const paid = useMemo(() => draft.installments.filter(item => item.status === 'Paid').reduce((sum, item) => sum + Number(item.amount), 0), [draft.installments]);
  const scheduled = useMemo(() => draft.installments.reduce((sum, item) => sum + Number(item.amount), 0), [draft.installments]);
  const accountMetrics = (account: StudentFeeAccount) => {
    const accountPaid = account.installments.filter(item => item.status === 'Paid').reduce((sum, item) => sum + Number(item.amount), 0);
    const balance = Math.max(0, Number(account.netFee) - accountPaid);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueInstallments = account.installments.filter(item => item.status !== 'Paid' && item.status !== 'Waived' && item.dueDate && new Date(`${item.dueDate}T00:00:00`) < today);
    const oldestDueDate = overdueInstallments.map(item => item.dueDate).sort()[0];
    const overdueDays = oldestDueDate ? Math.max(0, Math.floor((today.getTime() - new Date(`${oldestDueDate}T00:00:00`).getTime()) / 86400000)) : 0;
    return { accountPaid, balance, overdueDays, oldestDueDate, status: balance === 0 ? 'Paid' : overdueDays > 0 ? 'Overdue' : 'Pending' };
  };
  const allRows = useMemo(() => {
    const rosterRows = students.map(student => {
      const index = accounts.findIndex(account => account.studentId === student.id);
      return { student, account: index >= 0 ? accounts[index] : undefined, index };
    });
    const rosterIds = new Set(students.map(student => student.id));
    return [...rosterRows, ...accounts.map((account, index) => ({ account, index, student: undefined })).filter(row => !rosterIds.has(row.account.studentId))];
  }, [accounts, students]);
  const classes = useMemo(() => [...new Set(allRows.map(item => item.account?.className ?? item.student?.className).filter(Boolean) as string[])].sort(), [allRows]);
  const sections = useMemo(() => [...new Set(allRows.filter(item => classFilter === 'all' || (item.account?.className ?? item.student?.className) === classFilter).map(item => item.account?.section ?? item.student?.section).filter(Boolean) as string[])].sort(), [allRows, classFilter]);
  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return allRows.filter(({ account, student }) => {
      const rowClass = account?.className ?? student?.className ?? '';
      const rowSection = account?.section ?? student?.section ?? '';
      return (classFilter === 'all' || rowClass === classFilter) &&
        (sectionFilter === 'all' || rowSection === sectionFilter) &&
        (!query || [account?.studentName ?? student?.name, account?.studentId ?? student?.id, account?.admissionNumber].some(value => String(value ?? '').toLowerCase().includes(query)));
    }).sort((left, right) => {
      const leftMetrics = left.account ? accountMetrics(left.account) : { overdueDays: -1, balance: 0 };
      const rightMetrics = right.account ? accountMetrics(right.account) : { overdueDays: -1, balance: 0 };
      return rightMetrics.overdueDays - leftMetrics.overdueDays || rightMetrics.balance - leftMetrics.balance;
    });
  }, [allRows, classFilter, sectionFilter, search]);
  const overallSummary = useMemo(() => accounts.reduce((summary, account) => {
    const metrics = accountMetrics(account);
    summary.total += Number(account.netFee);
    summary.paid += metrics.accountPaid;
    summary.pending += metrics.balance;
    if (metrics.overdueDays > 0) {
      summary.overdueAmount += metrics.balance;
      summary.overdueStudents += 1;
    }
    return summary;
  }, { total: 0, paid: 0, pending: 0, overdueAmount: 0, overdueStudents: 0 }), [accounts]);
  const longPending = useMemo(() => accounts.map((account, index) => ({ account, index, ...accountMetrics(account) })).filter(item => item.overdueDays > 0).sort((a, b) => b.overdueDays - a.overdueDays), [accounts]);

  function openEditor(index: number) {
    setSelectedIndex(index);
    setIsEditorOpen(true);
  }

  function openStudentAccount(student: Student) {
    setSelectedIndex(-1);
    setDraft({ ...emptyAccount(), studentId: student.id, studentName: student.name, className: student.className, section: student.section, admissionNumber: `ADM-${student.id}` });
    setMessage('');
    setIsEditorOpen(true);
  }

  function chooseStudent(studentId: string) {
    const student = students.find(item => item.id === studentId);
    setDraft(previous => ({ ...previous, studentId, studentName: student?.name ?? '', className: student?.className ?? '', section: student?.section ?? '', admissionNumber: previous.admissionNumber || `ADM-${studentId}` }));
  }

  function patchInstallment(index: number, field: keyof FeeInstallment, value: string | number) {
    setDraft(previous => ({ ...previous, installments: previous.installments.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
  }

  async function saveAccount() {
    if (!draft.studentId || !draft.joiningDate || !draft.academicYear) {
      setMessage('Student, joining date, and academic year are required.');
      return;
    }
    const normalized = { ...draft, netFee: Math.max(0, Number(draft.totalFee) - Number(draft.discount)) };
    const updated = selectedIndex >= 0 ? accounts.map((item, index) => index === selectedIndex ? normalized : item) : [...accounts, normalized];
    try {
      await updateAdminContent('fees', updated);
      onSaved(updated);
      setIsEditorOpen(false);
      setSelectedIndex(-1);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save fee account.');
    }
  }

  async function deleteAccount(index: number) {
    const account = accounts[index];
    if (!account || !window.confirm(`Delete the fee account for ${account.studentName}?`)) return;
    try {
      const updated = accounts.filter((_, itemIndex) => itemIndex !== index);
      await updateAdminContent('fees', updated);
      onSaved(updated);
      setIsEditorOpen(false);
      setSelectedIndex(-1);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to remove fee account.');
    }
  }

  return (
    <div className="fee-management-form">
      <section className="fee-account-browser">
        <div className="fee-browser-heading">
          <div><strong>Student fee records</strong><span>{filteredAccounts.length} of {allRows.length} students</span></div>
          <button type="button" onClick={() => openEditor(-1)}>+ New fee account</button>
        </div>
        <div className="fee-overall-summary">
          <div><span>All students</span><strong>{students.length}</strong><small>{accounts.length} fee accounts configured</small></div>
          <div><span>Total net fees</span><strong>{money(overallSummary.total)}</strong><small>After discounts</small></div>
          <div><span>Total collected</span><strong>{money(overallSummary.paid)}</strong><small>{overallSummary.total ? Math.round((overallSummary.paid / overallSummary.total) * 100) : 0}% collected</small></div>
          <div><span>Overall pending</span><strong>{money(overallSummary.pending)}</strong><small>Across all fee accounts</small></div>
          <div className={overallSummary.overdueStudents ? 'alert' : ''}><span>Long pending</span><strong>{money(overallSummary.overdueAmount)}</strong><small>{overallSummary.overdueStudents} overdue students</small></div>
        </div>
        {longPending.length > 0 && <section className="long-pending-panel">
          <div><strong>Long-pending students</strong><span>Oldest unpaid installments appear first</span></div>
          <div className="long-pending-list">{longPending.slice(0, 6).map(item => <button type="button" key={item.account.id} onClick={() => openEditor(item.index)}>
            <span><strong>{item.account.studentName}</strong><small>{item.account.className}-{item.account.section} · due since {item.oldestDueDate}</small></span>
            <span><strong>{money(item.balance)}</strong><small>{item.overdueDays} days overdue</small></span>
          </button>)}</div>
        </section>}
        <div className="fee-browser-filters">
          <label>Search<input value={search} onChange={event => setSearch(event.target.value)} placeholder="Student name, ID, or admission no." /></label>
          <label>Class<select value={classFilter} onChange={event => { setClassFilter(event.target.value); setSectionFilter('all'); }}>
            <option value="all">All classes</option>{classes.map(value => <option value={value} key={value}>Class {value}</option>)}
          </select></label>
          <label>Section<select value={sectionFilter} onChange={event => setSectionFilter(event.target.value)}>
            <option value="all">All sections</option>{sections.map(value => <option value={value} key={value}>Section {value}</option>)}
          </select></label>
        </div>

        <div className="fee-table-wrap">
          <table className="fee-records-table">
            <thead><tr><th>Student</th><th>ID</th><th>Admission</th><th>Class</th><th>Joined</th><th>Year</th><th>Total</th><th>Discount</th><th>Paid</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredAccounts.length === 0 && <tr><td colSpan={12} className="empty-state">No student fee records match these filters.</td></tr>}
              {filteredAccounts.map(({ account, student, index }) => {
                const metrics = account ? accountMetrics(account) : null;
                return <tr key={account?.id ?? student?.id} className={metrics?.overdueDays ? 'overdue-fee-row' : ''}>
                  <td><strong>{account?.studentName ?? student?.name}</strong>{metrics?.overdueDays ? <small>{metrics.overdueDays} days overdue</small> : null}</td>
                  <td>{account?.studentId ?? student?.id}</td><td>{account?.admissionNumber ?? 'Not configured'}</td><td>{account?.className ?? student?.className}-{account?.section ?? student?.section}</td>
                  <td>{account?.joiningDate || '—'}</td><td>{account?.academicYear || '—'}</td><td>{account ? money(account.totalFee) : '—'}</td><td>{account ? money(account.discount) : '—'}</td>
                  <td>{account && metrics ? money(metrics.accountPaid) : '—'}</td><td>{account && metrics ? money(metrics.balance) : '—'}</td>
                  <td><span className={`fee-status ${account && metrics ? metrics.status.toLowerCase() : 'unconfigured'}`}>{account && metrics ? metrics.status : 'Not configured'}</span></td>
                  <td><div className="fee-row-actions">
                    <button type="button" title={account ? 'Edit' : 'Create fee account'} aria-label={`${account ? 'Edit' : 'Create'} ${account?.studentName ?? student?.name}`} onClick={() => account ? openEditor(index) : student && openStudentAccount(student)}>✎</button>
                    {account && <button type="button" className="delete" title="Delete" aria-label={`Delete ${account.studentName}`} onClick={() => deleteAccount(index)}>⌫</button>}
                  </div></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </section>

      {message && !isEditorOpen && <p className="feedback-error">{message}</p>}

      {isEditorOpen && <div className="fee-edit-backdrop" onClick={() => setIsEditorOpen(false)}>
        <section className="fee-edit-popup" onClick={event => event.stopPropagation()}>
          <div className="fee-popup-heading">
            <div><span>{selectedIndex >= 0 ? 'Edit fee account' : 'New fee account'}</span><h2>{draft.studentName || 'Student fees'}</h2></div>
            <button type="button" onClick={() => setIsEditorOpen(false)} aria-label="Close">×</button>
          </div>

          <div className="fee-summary-strip">
            <div><span>Net fee</span><strong>{money(draft.totalFee - draft.discount)}</strong></div>
            <div><span>Paid</span><strong>{money(paid)}</strong></div>
            <div><span>Balance</span><strong>{money(Math.max(0, draft.totalFee - draft.discount - paid))}</strong></div>
            <div><span>Scheduled</span><strong>{money(scheduled)}</strong></div>
          </div>

          <fieldset><legend>Student and joining details</legend><div className="fee-form-grid">
            <label>Student<select value={draft.studentId} onChange={event => chooseStudent(event.target.value)}><option value="">Select student…</option>{students.map(student => <option value={student.id} key={student.id}>{student.name} · {student.className}-{student.section}</option>)}</select></label>
            <label>Admission number<input value={draft.admissionNumber} onChange={event => setDraft({ ...draft, admissionNumber: event.target.value })} /></label>
            <label>Class<input value={draft.className} readOnly /></label><label>Section<input value={draft.section} readOnly /></label>
            <label>Joining date<input type="date" value={draft.joiningDate} onChange={event => setDraft({ ...draft, joiningDate: event.target.value })} /></label>
            <label>Academic year<input value={draft.academicYear} onChange={event => setDraft({ ...draft, academicYear: event.target.value })} /></label>
          </div></fieldset>

          <fieldset><legend>Fee structure</legend><div className="fee-form-grid">
            <label>Total fee<input type="number" min="0" value={draft.totalFee} onChange={event => setDraft({ ...draft, totalFee: Number(event.target.value) })} /></label>
            <label>Discount<input type="number" min="0" value={draft.discount} onChange={event => setDraft({ ...draft, discount: Number(event.target.value) })} /></label>
            <label>Net fee<input type="number" value={Math.max(0, draft.totalFee - draft.discount)} readOnly /></label>
          </div></fieldset>

          <fieldset><legend>Installment schedule</legend><div className="installment-table">
            <div className="installment-header"><span>Installment</span><span>Due date</span><span>Amount</span><span>Status</span><span>Paid date</span><span>Reference</span><span></span></div>
            {draft.installments.map((item, index) => <div className="installment-row" key={item.id}>
              <input aria-label="Installment label" value={item.label} onChange={event => patchInstallment(index, 'label', event.target.value)} />
              <input aria-label="Due date" type="date" value={item.dueDate} onChange={event => patchInstallment(index, 'dueDate', event.target.value)} />
              <input aria-label="Amount" type="number" min="0" value={item.amount} onChange={event => patchInstallment(index, 'amount', Number(event.target.value))} />
              <select aria-label="Status" value={item.status} onChange={event => patchInstallment(index, 'status', event.target.value)}>{['Pending', 'Paid', 'Overdue', 'Waived'].map(status => <option key={status}>{status}</option>)}</select>
              <input aria-label="Paid date" type="date" value={item.paidDate} onChange={event => patchInstallment(index, 'paidDate', event.target.value)} />
              <input aria-label="Payment reference" placeholder="Receipt / transaction ID" value={item.reference} onChange={event => patchInstallment(index, 'reference', event.target.value)} />
              <button type="button" onClick={() => setDraft({ ...draft, installments: draft.installments.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button>
            </div>)}
          </div><button type="button" className="form-add-button" onClick={() => setDraft({ ...draft, installments: [...draft.installments, emptyInstallment()] })}>+ Add installment</button></fieldset>

          {message && <p className="editor-message">{message}</p>}
          <div className="fee-form-actions">
            {selectedIndex >= 0 && <button type="button" className="danger" onClick={() => deleteAccount(selectedIndex)}>Remove account</button>}
            <button type="button" className="secondary" onClick={() => setIsEditorOpen(false)}>Cancel</button>
            <button type="button" onClick={saveAccount}>Save fee account</button>
          </div>
        </section>
      </div>}
    </div>
  );
}
