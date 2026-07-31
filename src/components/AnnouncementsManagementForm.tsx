import { useState } from 'react';
import { updateAdminContent } from '../services/api';
import type { Announcement } from '../types';

type AnnouncementRecord = Announcement & { id?: string };
const emptyAnnouncement = (): AnnouncementRecord => ({ id: globalThis.crypto?.randomUUID?.() ?? `announcement-${Date.now()}`, title: '', date: '', description: '', imageUrl: '' });

export default function AnnouncementsManagementForm({ announcements, onSaved }: {
  announcements: AnnouncementRecord[];
  onSaved: (announcements: AnnouncementRecord[]) => void;
}) {
  const [draft, setDraft] = useState<AnnouncementRecord>(emptyAnnouncement());
  const [editingIndex, setEditingIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  function openNew() {
    setEditingIndex(-1);
    setDraft(emptyAnnouncement());
    setMessage('');
    setIsOpen(true);
  }

  function openEdit(index: number) {
    setEditingIndex(index);
    setDraft(structuredClone(announcements[index]));
    setMessage('');
    setIsOpen(true);
  }

  async function save() {
    if (!draft.title.trim() || !draft.date.trim()) {
      setMessage('Title and date are required.');
      return;
    }
    const updated = editingIndex >= 0
      ? announcements.map((item, index) => index === editingIndex ? draft : item)
      : [...announcements, draft];
    try {
      await updateAdminContent('announcements', updated);
      onSaved(updated);
      setIsOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save announcement.');
    }
  }

  async function remove(index: number) {
    if (!window.confirm(`Delete “${announcements[index].title}”?`)) return;
    try {
      const updated = announcements.filter((_, itemIndex) => itemIndex !== index);
      await updateAdminContent('announcements', updated);
      onSaved(updated);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to delete announcement.');
    }
  }

  return (
    <div className="announcements-management">
      <div className="announcements-toolbar">
        <div><strong>All Announcements</strong><span>{announcements.length} published items</span></div>
        <button type="button" onClick={openNew}>+ Add Announcement</button>
      </div>
      <div className="announcements-table-wrap">
        <table className="announcements-table">
          <thead><tr><th>Image</th><th>Title</th><th>Description</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {announcements.length === 0 && <tr><td colSpan={5} className="empty-state">No announcements have been added.</td></tr>}
            {announcements.map((announcement, index) => <tr key={announcement.id ?? `${announcement.title}-${index}`}>
              <td>{announcement.imageUrl ? <img src={announcement.imageUrl} alt="" /> : <span className="announcement-image-placeholder">A</span>}</td>
              <td><strong>{announcement.title}</strong></td><td className="announcement-description-cell">{announcement.description || '—'}</td><td>{announcement.date}</td>
              <td><div className="admission-row-actions"><button type="button" className="admission-edit-button" onClick={() => openEdit(index)} title="Edit announcement">✎</button><button type="button" className="admission-delete-button" onClick={() => remove(index)} title="Delete announcement">⌫</button></div></td>
            </tr>)}
          </tbody>
        </table>
      </div>
      {message && !isOpen && <p className="feedback-error">{message}</p>}

      {isOpen && <div className="admission-popup-backdrop" onClick={() => setIsOpen(false)}>
        <section className="announcement-popup" onClick={event => event.stopPropagation()}>
          <div className="fee-popup-heading"><div><span>{editingIndex >= 0 ? 'Edit announcement' : 'New announcement'}</span><h2>{draft.title || 'Announcement details'}</h2></div><button type="button" onClick={() => setIsOpen(false)}>×</button></div>
          <div className="announcement-form">
            <label>Title<input value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} /></label>
            <label>Date<input value={draft.date} onChange={event => setDraft({ ...draft, date: event.target.value })} placeholder="Example: 23rd July, 2026" /></label>
            <label className="wide-field">Description<textarea rows={5} value={draft.description ?? ''} onChange={event => setDraft({ ...draft, description: event.target.value })} /></label>
            <label className="wide-field">Image URL<input value={draft.imageUrl ?? ''} onChange={event => setDraft({ ...draft, imageUrl: event.target.value })} placeholder="https://…" /></label>
          </div>
          {message && <p className="feedback-error">{message}</p>}
          <div className="admission-form-actions"><button type="button" className="secondary" onClick={() => setIsOpen(false)}>Cancel</button><button type="button" onClick={save}>Save announcement</button></div>
        </section>
      </div>}
    </div>
  );
}
