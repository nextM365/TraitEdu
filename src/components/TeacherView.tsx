import type { Teacher } from '../types';

interface Props {
  teachers: Teacher[];
}

export default function TeacherView({ teachers }: Props) {
  return (
    <div className="module-card">
      <h2>Teacher directory</h2>
      <table className="module-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Subject</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map(teacher => (
            <tr key={teacher.email}>
              <td>{teacher.name}</td>
              <td>{teacher.subject}</td>
              <td>{teacher.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
