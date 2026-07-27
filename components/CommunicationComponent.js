export default class CommunicationComponent {
  constructor(root, messages = []) {
    this.root = root;
    this.messages = messages;
  }

  render() {
    this.root.innerHTML = `
      <div>
        <div class="card-header">
          <h2>Parent-school communication</h2>
        </div>
        <ul class="data-list"></ul>
        <form class="small-form" id="message-form">
          <input type="text" placeholder="Send a message" />
          <button type="submit">Send</button>
        </form>
      </div>
    `;

    const list = this.root.querySelector('.data-list');
    this.messages.forEach(msg => list.appendChild(this.createItem(msg)));
  }

  createItem(text) {
    const li = document.createElement('li');
    li.textContent = text;
    return li;
  }
}
