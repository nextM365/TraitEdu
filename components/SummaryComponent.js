export default class SummaryComponent {
  constructor(root, metrics = []) {
    this.root = root;
    this.metrics = metrics;
  }

  renderCard(metric) {
    const card = document.createElement('article');
    card.className = 'metric-card';
    card.innerHTML = `
      <h2>${metric.title}</h2>
      <p><strong>${metric.value}</strong></p>
      <small>${metric.subtitle}</small>
    `;
    return card;
  }

  render() {
    this.root.innerHTML = '';
    this.metrics.forEach(metric => this.root.appendChild(this.renderCard(metric)));
  }
}
