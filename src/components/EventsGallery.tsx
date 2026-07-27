import { useState } from 'react';
import type { EventItem } from '../types';

interface EventsGalleryProps {
  events: EventItem[];
}

export default function EventsGallery({ events }: EventsGalleryProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  if (selectedEvent) {
    return (
      <div className="events-page">
        <div className="events-detail-header">
          <button type="button" className="back-button" onClick={() => setSelectedEvent(null)}>
            ←
          </button>
          <div>
            <h1>{selectedEvent.title}</h1>
            <p className="event-meta">{selectedEvent.subtitle}</p>
            <p className="event-meta detail-meta">at {selectedEvent.time} on {selectedEvent.date}</p>
          </div>
        </div>

        <div className="event-detail-description">
          <p>{selectedEvent.description}</p>
        </div>

        <div className="event-gallery-grid">
          {selectedEvent.gallery.map((photo, idx) => (
            <div key={idx} className="event-gallery-card">
              <img src={photo} alt={`${selectedEvent.title} photo ${idx + 1}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="events-header">
        <div>
          <h1>Completed Events</h1>
          <p className="event-count">Showing {events.length} of {events.length}</p>
        </div>
        <button type="button" className="events-filter-button">
          <span>📅</span>
        </button>
      </div>

      <div className="events-list">
        {events.map(event => (
          <button
            key={event.id}
            type="button"
            className="event-card"
            onClick={() => setSelectedEvent(event)}>
            <div className="event-card-image">
              <img src={event.imageUrl} alt={event.title} />
            </div>
            <div className="event-card-body">
              <h2>{event.title}</h2>
              <p className="event-card-subtitle">{event.subtitle}</p>
              <p className="event-card-meta">at {event.time} on {event.date}</p>
            </div>
            <div className="event-card-action">›</div>
          </button>
        ))}
      </div>
    </div>
  );
}
