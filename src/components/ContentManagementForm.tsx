import { useEffect, useState } from 'react';
import { updateAdminContent } from '../services/api';

type Field = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'date' | 'time' | 'number' | 'checkbox' | 'select' | 'list';
  options?: string[];
  placeholder?: string;
};

type ModuleConfig = {
  kind: 'collection' | 'object';
  itemLabel: string;
  fields: Field[];
};

const configs: Record<string, ModuleConfig> = {
  admissions: {
    kind: 'collection', itemLabel: 'admission',
    fields: [
      { key: 'studentId', label: 'Student ID / admission ID' },
      { key: 'studentName', label: 'Student full name' },
      { key: 'dateOfBirth', label: 'Date of birth', type: 'date' },
      { key: 'parentName', label: 'Parent or guardian name' },
      { key: 'parentPhone', label: 'Parent phone' },
      { key: 'parentEmail', label: 'Parent email' },
      { key: 'className', label: 'Requested class' },
      { key: 'section', label: 'Section' },
      { key: 'joiningDate', label: 'Joining date', type: 'date' },
      { key: 'previousSchool', label: 'Previous school' },
      { key: 'status', label: 'Admission status', type: 'select', options: ['Application received', 'Documents pending', 'Under review', 'Approved', 'Enrolled', 'Rejected'] },
      { key: 'notes', label: 'Admission notes', type: 'textarea' },
    ],
  },
  announcements: {
    kind: 'collection', itemLabel: 'announcement',
    fields: [
      { key: 'title', label: 'Title' }, { key: 'date', label: 'Date' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'imageUrl', label: 'Image URL', placeholder: 'https://…' },
    ],
  },
  achievements: {
    kind: 'collection', itemLabel: 'achievement',
    fields: [
      { key: 'title', label: 'Title' }, { key: 'date', label: 'Date' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'imageUrl', label: 'Image URL', placeholder: 'https://…' },
    ],
  },
  examResults: {
    kind: 'collection', itemLabel: 'result',
    fields: [
      { key: 'subject', label: 'Subject' }, { key: 'marks', label: 'Marks', type: 'number' },
      { key: 'grade', label: 'Grade' },
    ],
  },
  fees: {
    kind: 'object', itemLabel: 'fee configuration',
    fields: [
      { key: 'due', label: 'Amount due' }, { key: 'paid', label: 'Amount paid' },
      { key: 'total', label: 'Total fees' }, { key: 'nextInstallment', label: 'Next installment', type: 'date' },
    ],
  },
  attendance: {
    kind: 'collection', itemLabel: 'attendance record',
    fields: [
      { key: 'name', label: 'Student name' },
      { key: 'status', label: 'Status', type: 'select', options: ['Present', 'Late', 'Absent'] },
    ],
  },
  opinionPolls: {
    kind: 'collection', itemLabel: 'poll',
    fields: [
      { key: 'title', label: 'Poll question' },
      { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Open', 'Closed'] },
    ],
  },
  parentConcerns: {
    kind: 'collection', itemLabel: 'concern',
    fields: [
      { key: 'title', label: 'Concern title' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['New', 'In review', 'Resolved'] },
    ],
  },
  busTracking: {
    kind: 'object', itemLabel: 'transport configuration',
    fields: [
      { key: 'enabled', label: 'Enable bus tracking', type: 'checkbox' },
      { key: 'provider', label: 'Transport provider' },
      { key: 'supportPhone', label: 'Support phone' },
    ],
  },
  wellness: {
    kind: 'collection', itemLabel: 'wellness article',
    fields: [
      { key: 'category', label: 'Category', type: 'select', options: ['Parenting', 'Soft Skills', 'Wellness Corner'] },
      { key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'date', label: 'Display date' },
    ],
  },
  gatePass: {
    kind: 'object', itemLabel: 'gate-pass configuration',
    fields: [
      { key: 'enabled', label: 'Enable gate passes', type: 'checkbox' },
      { key: 'approvalRequired', label: 'Require approval', type: 'checkbox' },
    ],
  },
  events: {
    kind: 'collection', itemLabel: 'event',
    fields: [
      { key: 'title', label: 'Event title' }, { key: 'subtitle', label: 'Subtitle' },
      { key: 'date', label: 'Date' }, { key: 'time', label: 'Time' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'imageUrl', label: 'Cover image URL' },
      { key: 'gallery', label: 'Gallery image URLs', type: 'list', placeholder: 'One image URL per line' },
    ],
  },
};

function newItem(config: ModuleConfig) {
  const item: Record<string, unknown> = { id: globalThis.crypto?.randomUUID?.() ?? `item-${Date.now()}-${Math.random()}` };
  config.fields.forEach(field => {
    item[field.key] = field.type === 'checkbox' ? false : field.type === 'number' ? 0 : field.type === 'list' ? [] : '';
  });
  return item;
}

export default function ContentManagementForm({
  moduleName,
  content,
  onSaved,
}: {
  moduleName: string;
  content: unknown;
  onSaved: (content: unknown) => void;
}) {
  const config = configs[moduleName];
  const [draft, setDraft] = useState<Record<string, unknown> | Array<Record<string, unknown>>>(() =>
    structuredClone((content ?? (configs[moduleName]?.kind === 'collection' ? [] : {})) as Record<string, unknown>)
  );
  const [message, setMessage] = useState('');
  const [itemDraft, setItemDraft] = useState<Record<string, unknown>>({});
  const [editingIndex, setEditingIndex] = useState(-1);
  const [isItemOpen, setIsItemOpen] = useState(false);

  useEffect(() => {
    setDraft(structuredClone((content ?? (config?.kind === 'collection' ? [] : {})) as Record<string, unknown>));
    setMessage('');
  }, [content, config?.kind]);

  if (!config) return <p className="feedback-error">This module does not have a form configuration.</p>;

  function renderField(field: Field, value: unknown, onChange: (value: unknown) => void) {
    if (field.type === 'checkbox') {
      return <label className="admin-checkbox"><input type="checkbox" checked={Boolean(value)} onChange={event => onChange(event.target.checked)} />{field.label}</label>;
    }
    if (field.type === 'textarea' || field.type === 'list') {
      const textValue = field.type === 'list' && Array.isArray(value) ? value.join('\n') : String(value ?? '');
      return <label>{field.label}<textarea rows={3} placeholder={field.placeholder} value={textValue} onChange={event => onChange(field.type === 'list' ? event.target.value.split('\n').map(item => item.trim()).filter(Boolean) : event.target.value)} /></label>;
    }
    if (field.type === 'select') {
      return <label>{field.label}<select value={String(value ?? '')} onChange={event => onChange(event.target.value)}>
        <option value="">Select…</option>{field.options?.map(option => <option key={option}>{option}</option>)}
      </select></label>;
    }
    return <label>{field.label}<input type={field.type ?? 'text'} placeholder={field.placeholder} value={String(value ?? '')} onChange={event => onChange(field.type === 'number' ? Number(event.target.value) : event.target.value)} /></label>;
  }

  async function save() {
    try {
      await updateAdminContent(moduleName, draft);
      onSaved(draft);
      setMessage('Changes saved for this school.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save changes.');
    }
  }

  function openNewItem() {
    setEditingIndex(-1);
    setItemDraft(newItem(config));
    setMessage('');
    setIsItemOpen(true);
  }

  function openEditItem(item: Record<string, unknown>, index: number) {
    setEditingIndex(index);
    setItemDraft(structuredClone(item));
    setMessage('');
    setIsItemOpen(true);
  }

  async function saveCollectionItem(collection: Array<Record<string, unknown>>) {
    const updated = editingIndex >= 0
      ? collection.map((item, index) => index === editingIndex ? itemDraft : item)
      : [...collection, itemDraft];
    try {
      await updateAdminContent(moduleName, updated);
      setDraft(updated);
      onSaved(updated);
      setIsItemOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save item.');
    }
  }

  async function removeCollectionItem(collection: Array<Record<string, unknown>>, index: number) {
    if (!window.confirm(`Delete this ${config.itemLabel}?`)) return;
    const updated = collection.filter((_, itemIndex) => itemIndex !== index);
    try {
      await updateAdminContent(moduleName, updated);
      setDraft(updated);
      onSaved(updated);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to delete item.');
    }
  }

  function displayValue(field: Field, value: unknown) {
    if (field.type === 'list') return Array.isArray(value) ? `${value.length} items` : '0 items';
    if (field.type === 'checkbox') return value ? 'Yes' : 'No';
    const text = String(value ?? '');
    return text.length > 90 ? `${text.slice(0, 90)}…` : text || '—';
  }

  const collection = config.kind === 'collection'
    ? (Array.isArray(draft) ? draft : [])
    : null;
  const objectDraft = config.kind === 'object'
    ? (!Array.isArray(draft) ? draft : {})
    : null;

  return (
    <div className="content-management-form">
      {collection && (
        <>
          <div className="content-form-toolbar">
            <span>All {config.itemLabel}s · {collection.length} {collection.length === 1 ? 'item' : 'items'}</span>
            <button type="button" onClick={openNewItem}>+ Add {config.itemLabel}</button>
          </div>
          <div className="generic-content-table-wrap">
            <table className="generic-content-table">
              <thead><tr>{config.fields.map(field => <th key={field.key}>{field.label}</th>)}<th>Actions</th></tr></thead>
              <tbody>
                {collection.length === 0 && <tr><td colSpan={config.fields.length + 1} className="empty-state">No items yet. Add the first {config.itemLabel}.</td></tr>}
                {collection.map((item, index) => <tr key={String(item.id ?? index)}>
                  {config.fields.map(field => <td key={field.key} className={field.type === 'textarea' ? 'long-content-cell' : ''}>{displayValue(field, item[field.key])}</td>)}
                  <td><div className="generic-row-actions"><button type="button" onClick={() => openEditItem(item, index)} title={`Edit ${config.itemLabel}`}>✎</button><button type="button" className="delete" onClick={() => removeCollectionItem(collection, index)} title={`Delete ${config.itemLabel}`}>⌫</button></div></td>
                </tr>)}
              </tbody>
            </table>
          </div>
          {isItemOpen && <div className="generic-item-popup-backdrop" onClick={() => setIsItemOpen(false)}>
            <section className="generic-item-popup" onClick={event => event.stopPropagation()}>
              <div className="fee-popup-heading"><div><span>{editingIndex >= 0 ? `Edit ${config.itemLabel}` : `New ${config.itemLabel}`}</span><h2>{String(itemDraft.title ?? itemDraft.name ?? itemDraft.subject ?? config.itemLabel)}</h2></div><button type="button" onClick={() => setIsItemOpen(false)}>×</button></div>
              <div className="content-field-grid">
                {config.fields.map(field => <div className={field.type === 'textarea' || field.type === 'list' ? 'wide-field' : ''} key={field.key}>
                  {renderField(field, itemDraft[field.key], value => setItemDraft(previous => ({ ...previous, [field.key]: value })))}
                </div>)}
              </div>
              {message && <p className="feedback-error">{message}</p>}
              <div className="admission-form-actions"><button type="button" className="secondary" onClick={() => setIsItemOpen(false)}>Cancel</button><button type="button" onClick={() => saveCollectionItem(collection)}>Save {config.itemLabel}</button></div>
            </section>
          </div>}
        </>
      )}
      {objectDraft && (
        <fieldset className="content-item-form">
          <legend>{config.itemLabel}</legend>
          <div className="content-field-grid">
            {config.fields.map(field => (
              <div className={field.type === 'textarea' ? 'wide-field' : ''} key={field.key}>
                {renderField(field, objectDraft[field.key], value => setDraft({ ...objectDraft, [field.key]: value }))}
              </div>
            ))}
          </div>
        </fieldset>
      )}
      {message && <p className="editor-message">{message}</p>}
      {objectDraft && <div className="content-form-actions"><button type="button" onClick={save}>Save changes</button></div>}
    </div>
  );
}
