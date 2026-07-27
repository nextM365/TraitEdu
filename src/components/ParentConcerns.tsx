import { useState } from 'react';

interface ConcernItem {
  id: string;
  title: string;
  category: string;
  status: 'open' | 'resolved';
  date: string;
  description: string;
}

const initialConcerns: ConcernItem[] = [
  {
    id: 'concern-1',
    title: 'Transport safety along the morning route',
    category: 'Bus & Transport',
    status: 'open',
    date: '2026-07-26',
    description: 'The bus arrives late and students are waiting on the roadside without shade.',
  },
  {
    id: 'concern-2',
    title: 'Homework volume for grade 6',
    category: 'Academics',
    status: 'resolved',
    date: '2026-07-18',
    description: 'The amount of homework seems too high for the current timetable. Parents request a balanced approach.',
  },
  {
    id: 'concern-3',
    title: 'Canteen food hygiene',
    category: 'Health',
    status: 'open',
    date: '2026-07-22',
    description: 'Several students reported stale snacks last week; please review the canteen quality checks.',
  },
];

export default function ParentConcerns() {
  const [concerns, setConcerns] = useState<ConcernItem[]>(initialConcerns);
  const [selectedConcern, setSelectedConcern] = useState<ConcernItem | null>(null);
  const [newConcernText, setNewConcernText] = useState('');
  const [newConcernCategory, setNewConcernCategory] = useState('General');
  const [added, setAdded] = useState(false);

  const addConcern = () => {
    if (!newConcernText.trim()) return;

    const nextConcern: ConcernItem = {
      id: `concern-${concerns.length + 1}`,
      title: newConcernText.trim(),
      category: newConcernCategory,
      status: 'open',
      date: new Date().toISOString().slice(0, 10),
      description: `${newConcernText.trim()} Please add more details in case you want to share an update.`,
    };

    setConcerns(prev => [nextConcern, ...prev]);
    setNewConcernText('');
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="parent-concerns-page">
      <div className="page-header">
        <div>
          <p className="page-tag">Parent Concerns</p>
          <h1>Existing concerns</h1>
        </div>
      </div>

      <div className="concern-action-bar">
        <div>
          <p className="section-label">Add a new concern</p>
          <p className="section-description">Share your concern with the school administration for faster resolution.</p>
        </div>
      </div>

      <div className="concern-grid">
        <section className="concern-list-panel">
          <div className="concern-list-header">
            <h2>All concerns</h2>
            <p>{concerns.length} items</p>
          </div>

          <div className="concern-list">
            {concerns.map(concern => (
              <button
                key={concern.id}
                type="button"
                className={`concern-card ${selectedConcern?.id === concern.id ? 'selected' : ''}`}
                onClick={() => setSelectedConcern(concern)}>
                <div>
                  <h3>{concern.title}</h3>
                  <p>{concern.category}</p>
                </div>
                <span className={`concern-status ${concern.status}`}>{concern.status}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="concern-detail-panel">
          <div className="concern-add-card">
            <div>
              <label htmlFor="concern-text" className="input-label">Concern title</label>
              <input
                id="concern-text"
                value={newConcernText}
                onChange={event => setNewConcernText(event.target.value)}
                className="text-input"
                placeholder="Describe your concern in a sentence"
              />
            </div>
            <div>
              <label htmlFor="concern-category" className="input-label">Category</label>
              <select
                id="concern-category"
                value={newConcernCategory}
                onChange={event => setNewConcernCategory(event.target.value)}
                className="text-input">
                <option>General</option>
                <option>Academics</option>
                <option>Health</option>
                <option>Bus & Transport</option>
                <option>Food</option>
              </select>
            </div>
            <button type="button" className="primary-button" onClick={addConcern}>
              Add concern
            </button>
            {added && <p className="success-note">Concern added successfully.</p>}
          </div>

          {selectedConcern ? (
            <div className="concern-detail-card">
              <div className="concern-detail-header">
                <div>
                  <p className="concern-detail-category">{selectedConcern.category}</p>
                  <h2>{selectedConcern.title}</h2>
                </div>
                <span className={`concern-status ${selectedConcern.status}`}>{selectedConcern.status}</span>
              </div>
              <p className="concern-detail-date">{selectedConcern.date}</p>
              <p className="concern-detail-description">{selectedConcern.description}</p>
            </div>
          ) : (
            <div className="concern-empty-state">
              <p>Select a concern from the list to view details.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
