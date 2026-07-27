export default class ExamResultsComponent {
  constructor(root, results = []) {
    this.root = root;
    this.results = results;
  }

  render() {
    this.root.innerHTML = `
      <div>
        <div class="card-header">
          <h2>Examination results</h2>
        </div>
        <ul class="table-list"></ul>
      </div>
    `;

    const list = this.root.querySelector('.table-list');
    this.results.forEach(result => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${result.subject}</strong>: ${result.marks} / 100 — ${result.grade}`;
      list.appendChild(li);
    });
  }
}
