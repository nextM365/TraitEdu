export default class AttendanceComponent {
  constructor(root, students = []) {
    this.root = root;
    this.students = students;
  }

  render() {
    this.root.innerHTML = `
      <div class="card-header">
        <h2>Student attendance tracking</h2>
        <span class="label">Live status</span>
      </div>
      <ul class="data-list"></ul>
    `;

    const list = this.root.querySelector('.data-list');
    this.students.forEach(student => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${student.name}</strong> — ${student.status}`;
      list.appendChild(li);
    });
  }
}
