export default class HomeworkComponent {
  constructor(root, tasks = []) {
    this.root = root;
    this.tasks = tasks;
  }

  render() {
    this.root.innerHTML = `
      <div>
        <div class="card-header">
          <h2>Homework updates</h2>
          <span class="label label-secondary">Due soon</span>
        </div>
        <ul class="data-list"></ul>
        <form class="small-form" id="homework-form">
          <input type="text" placeholder="Add homework update" />
          <button type="submit">Add</button>
        </form>
      </div>
    `;

    const list = this.root.querySelector('.data-list');
    this.tasks.forEach(task => list.appendChild(this.createItem(task)));

    const form = this.root.querySelector('#homework-form');
    const input = form.querySelector('input');
    form.addEventListener('submit', event => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) return;
      this.tasks.unshift(value);
      input.value = '';
      this.render();
    });
  }

  createItem(text) {
    const li = document.createElement('li');
    li.textContent = text;
    return li;
  }
}
