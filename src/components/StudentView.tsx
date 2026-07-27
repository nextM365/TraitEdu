import type { Student } from '../types';

interface Props {
  students: Student[];
}

export default function StudentView({ students }: Props) {
  return (
    <div className="module-card">
      <h2>Student roster</h2>
      <table className="module-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Grade</th>
            <th>Section</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.grade}</td>
              <td>{student.section}</td>
              <td>
                <span className="status-badge">{student.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
