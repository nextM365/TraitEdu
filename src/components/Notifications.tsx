interface NotificationsProps {
  notifications: string[];
}

function getNotificationType(note: string) {
  if (note.toLowerCase().includes('event')) return 'Events';
  if (note.toLowerCase().includes('announcement')) return 'Announcement';
  if (note.toLowerCase().includes('principal')) return 'Announcement';
  return 'Update';
}

export default function Notifications({ notifications }: NotificationsProps) {
  return (
    <div className="module-card notification-panel">
      <div className="card-header">
        <h2>All Notifications</h2>
      </div>

      <div className="notification-list">
        {notifications.map((note, index) => (
          <article key={`${note}-${index}`} className="notification-card">
            <div className="notification-header">
              <span className="notification-title">{getNotificationType(note)}:</span>
              <span className="notification-badge">NEW</span>
            </div>
            <p className="notification-body">{note}</p>
            <div className="notification-footer">
              <span className="notification-date">on Thursday - 23rd July, 2026 at 5:47 PM</span>
              <span className="notification-dot"></span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
