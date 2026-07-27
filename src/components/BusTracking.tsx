const stops = [
  { name: 'Green Valley', time: '07:05 AM', completed: true },
  { name: 'River Park', time: '07:15 AM', completed: true },
  { name: 'Sunset Point', time: '07:28 AM', completed: false },
  { name: 'Central Campus', time: '07:40 AM', completed: false },
];

export default function BusTracking() {
  return (
    <div className="bus-tracking-page">
      <div className="bus-tracking-header">
        <h1>Bus Tracking</h1>
        <p>Track the assigned school bus and follow the student route in real time.</p>
      </div>

      <div className="bus-tracking-grid">
        <section className="bus-status-panel">
          <div className="bus-status-card">
            <div>
              <p className="status-label">Live Route</p>
              <h2>Bus #12</h2>
              <p className="status-copy">Route: Green Valley → Central Campus</p>
            </div>
            <div className="status-meta">
              <span>Arriving in</span>
              <strong>8 min</strong>
            </div>
          </div>

          <div className="bus-detail-card">
            <div>
              <h3>Current Location</h3>
              <p>Sunset Point</p>
            </div>
            <div>
              <h3>Student Pickup</h3>
              <p>Waiting at Sunset Point</p>
            </div>
            <div>
              <h3>Driver</h3>
              <p>Mr. Ramesh</p>
            </div>
          </div>

          <div className="bus-route-card">
            <h3>Upcoming Stops</h3>
            <ul className="bus-stop-list">
              {stops.map((stop, index) => (
                <li key={stop.name} className={stop.completed ? 'completed' : ''}>
                  <span className="stop-name">{stop.name}</span>
                  <span className="stop-time">{stop.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bus-map-panel">
          <div className="bus-map-frame">
            <div className="bus-map-overlay">
              <div className="map-stop map-start">
                <span>Green Valley</span>
              </div>
              <div className="map-stop map-middle">
                <span>River Park</span>
              </div>
              <div className="map-stop map-current">
                <span>Sunset Point</span>
                <strong>Bus here</strong>
              </div>
              <div className="map-stop map-end">
                <span>Central Campus</span>
              </div>
            </div>
          </div>
          <div className="map-legend-card">
            <p className="legend-title">Route overview</p>
            <p className="legend-copy">
              The bus is on its way to Central Campus after completing two stops. Students can track the estimated arrival and live route progress here.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
