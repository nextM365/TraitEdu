import type { SchoolData } from '../types';

interface Props {
  school: SchoolData | null;
}

export default function SchoolView({ school }: Props) {
  if (!school) {
    return <div className="module-card">School data is unavailable.</div>;
  }

  return (
    <div className="module-card">
      <h2>School overview</h2>
      <p>{school.name}</p>
      <p>{school.address}</p>
      <p>
        <strong>School code:</strong> {school.code}
      </p>
      <p>
        <strong>Principal:</strong> {school.principal}
      </p>
      <p>
        <strong>Established:</strong> {school.established}
      </p>
      <p>
        <strong>Contact:</strong> {school.contact.phone} · {school.contact.email}
      </p>

      <div className="module-grid">
        <div className="module-card">
          <h3>Total students</h3>
          <p>{school.totalStudents}</p>
        </div>
        <div className="module-card">
          <h3>Total teachers</h3>
          <p>{school.totalTeachers}</p>
        </div>
        <div className="module-card">
          <h3>Total classes</h3>
          <p>{school.totalClasses}</p>
        </div>
      </div>

      <div className="module-card">
        <h3>Upcoming events</h3>
        <ul>
          {school.upcomingEvents.map(event => (
            <li key={event.title}>
              {event.title} — {event.date}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
