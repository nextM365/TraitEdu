import type { Announcement } from '../types';

interface AchievementsViewProps {
  achievements: Announcement[];
}

export default function AchievementsView({ achievements }: AchievementsViewProps) {
  return (
    <div className="module-card achievements-view">
      <div className="card-header">
        <h2>Achievements</h2>
        <p>Recent student and school accomplishments.</p>
      </div>
      <div className="achievement-list">
        {achievements.map(item => (
          <article key={item.title} className="achievement-card">
            {item.imageUrl && (
              <div className="achievement-image">
                <img src={item.imageUrl} alt={item.title} />
              </div>
            )}
            <div className="achievement-details">
              <p className="achievement-tag">RESULTS ACHIEVEMENT</p>
              <h3>{item.title}</h3>
              {item.description && <p>{item.description}</p>}
              <p className="achievement-date">{item.date}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
