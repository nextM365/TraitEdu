import type { Metric } from '../types';

interface PerformanceProps {
  metrics: Metric[];
}

export default function Performance({ metrics }: PerformanceProps) {
  return (
    <div>
      <div className="card-header">
        <h2>Academic performance</h2>
      </div>
      <div className="performance-grid">
        {metrics.map(metric => (
          <div key={metric.label} className="performance-card">
            <strong>{metric.label}</strong>
            <p>{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
