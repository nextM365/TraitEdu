export default class NotificationsComponent {
  constructor(root, notifications = []) {
    this.root = root;
    this.notifications = notifications;
  }

  render() {
    this.root.innerHTML = `
      <div class="card-header">
        <h2>Entry/exit notifications</h2>
        <span class="label label-secondary">Recent</span>
      </div>
      <ul class="data-list"></ul>
    `;

    const list = this.root.querySelector('.data-list');
    this.notifications.forEach(note => list.appendChild(this.createItem(note)));
  }

  createItem(text) {
    const li = document.createElement('li');
    li.textContent = text;
    return li;
  }
}
