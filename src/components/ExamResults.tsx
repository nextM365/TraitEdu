import type { ExamResult } from '../types';

interface ExamResultsProps {
  results: ExamResult[];
}

export default function ExamResults({ results }: ExamResultsProps) {
  return (
    <div>
      <div className="card-header">
        <h2>Examination results</h2>
      </div>
      <ul className="table-list">
        {results.map(result => (
          <li key={result.subject}>
            <strong>{result.subject}</strong>: {result.marks} / 100 — {result.grade}
          </li>
        ))}
      </ul>
    </div>
  );
}
