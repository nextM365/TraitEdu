import type { FeesInfo } from '../types';

interface FeesProps {
  fees: FeesInfo;
}

export default function Fees({ fees }: FeesProps) {
  return (
    <div>
      <div className="card-header">
        <h2>Fee and financial information</h2>
      </div>
      <div className="info-box">
        <p><strong>Total due:</strong> {fees.due}</p>
        <p><strong>Paid so far:</strong> {fees.paid}</p>
        <p><strong>Total fees:</strong> {fees.total}</p>
        <p><strong>Next installment:</strong> {fees.nextInstallment}</p>
      </div>
    </div>
  );
}
