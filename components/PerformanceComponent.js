export default class PerformanceComponent {
  constructor(root, metrics = []) {
    this.root = root;
    this.metrics = metrics;
  }

  render() {
    this.root.innerHTML = `
      <div>
        <div class="card-header">
          <h2>Academic performance</h2>
        </div>
        <div class="performance-grid"></div>
      </div>
    `;

    const grid = this.root.querySelector('.performance-grid');
    this.metrics.forEach(metric => {
      const card = document.createElement('div');
      card.className = 'performance-card';
      card.innerHTML = `<strong>${metric.label}</strong><p>${metric.value}</p>`;
      grid.appendChild(card);
    });
  }
}
