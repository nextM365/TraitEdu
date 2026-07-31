import { useMemo, useState } from 'react';
import type { AuthUser, Student } from '../types';

interface Props {
  students: Student[];
  role: AuthUser['role'];
}

export default function StudentView({ students, role }: Props) {
  const isAdmin = role === 'branch_admin' || role === 'school_admin';
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const classes = useMemo(() => [...new Set(students.map(student => student.className))].sort(), [students]);
  const sections = useMemo(() => [...new Set(
    students
      .filter(student => selectedClass === 'all' || student.className === selectedClass)
      .map(student => student.section)
  )].sort(), [students, selectedClass]);
  const visibleStudents = students.filter(student =>
    (selectedClass === 'all' || student.className === selectedClass) &&
    (selectedSection === 'all' || student.section === selectedSection)
  );

  return (
    <div className="module-card">
      <div className="roster-heading">
        <div>
          <h2>{isAdmin ? 'Student roster' : role === 'teacher' ? 'My assigned students' : 'My class assignment'}</h2>
          <p>{isAdmin ? 'Students are grouped by their assigned class and section.' : role === 'teacher' ? 'Only students from your assigned classes and sections are shown.' : 'Your school has assigned you to this class and section.'}</p>
        </div>
        {role !== 'student' && (
          <div className="roster-filters">
            <label>Class
              <select value={selectedClass} onChange={event => {
                setSelectedClass(event.target.value);
                setSelectedSection('all');
              }}>
                <option value="all">All classes</option>
                {classes.map(value => <option key={value} value={value}>Class {value}</option>)}
              </select>
            </label>
            <label>Section
              <select value={selectedSection} onChange={event => setSelectedSection(event.target.value)}>
                <option value="all">All sections</option>
                {sections.map(value => <option key={value} value={value}>Section {value}</option>)}
              </select>
            </label>
          </div>
        )}
      </div>
      <table className="module-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Class</th>
            <th>Section</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {visibleStudents.map(student => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.className}</td>
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
