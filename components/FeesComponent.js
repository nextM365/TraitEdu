export default class FeesComponent {
  constructor(root, fees = {}) {
    this.root = root;
    this.fees = fees;
  }

  render() {
    this.root.innerHTML = `
      <div>
        <div class="card-header">
          <h2>Fee and financial information</h2>
        </div>
        <div class="info-box"></div>
      </div>
    `;

    const box = this.root.querySelector('.info-box');
    box.innerHTML = `
      <p><strong>Total due:</strong> ${this.fees.due}</p>
      <p><strong>Paid so far:</strong> ${this.fees.paid}</p>
      <p><strong>Total fees:</strong> ${this.fees.total}</p>
      <p><strong>Next installment:</strong> ${this.fees.nextInstallment}</p>
    `;
  }
}
