import { useMemo, useState } from 'react';
import type { WellnessItem } from '../types';

interface WellnessProps {
  items: WellnessItem[];
}

const categories = ['Parenting', 'Soft Skills', 'Wellness Corner'] as const;

type WellnessCategory = (typeof categories)[number];

export default function Wellness({ items }: WellnessProps) {
  const [activeCategory, setActiveCategory] = useState<WellnessCategory>('Parenting');

  const filteredItems = useMemo(
    () => items.filter(item => item.category === activeCategory),
    [activeCategory, items],
  );

  return (
    <div className="wellness-page">
      <div className="wellness-header">
        <button type="button" className="back-button">←</button>
        <h1>Wellness</h1>
      </div>

      <div className="wellness-filter-bar">
        <span className="filter-label">Filter by Category</span>
        <div className="filter-chips">
          {categories.map(category => (
            <button
              key={category}
              type="button"
              className={category === activeCategory ? 'filter-chip active' : 'filter-chip'}
              onClick={() => setActiveCategory(category)}>
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="wellness-summary">
        <p className="wellness-summary-title">Previous</p>
        <p className="wellness-summary-count">Showing {filteredItems.length} of {items.length}</p>
      </div>

      <div className="wellness-list">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <button key={item.id} type="button" className="wellness-card">
              <div className="wellness-card-content">
                <span className="wellness-card-category">{item.category}</span>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                <p className="wellness-card-date">{item.date}</p>
              </div>
              <div className="wellness-card-arrow">›</div>
            </button>
          ))
        ) : (
          <div className="wellness-empty-state">
            <p>No wellness items found for {activeCategory}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
