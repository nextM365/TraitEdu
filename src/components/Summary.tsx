import type { Metric } from '../types';

interface SummaryProps {
  metrics: Metric[];
}

export default function Summary({ metrics }: SummaryProps) {
  return (
    <>
      {metrics.map(metric => (
        <article key={metric.title} className="metric-card">
          <h2>{metric.title}</h2>
          <p>
            <strong>{metric.value}</strong>
          </p>
          <small>{metric.subtitle}</small>
        </article>
      ))}
    </>
  );
}
