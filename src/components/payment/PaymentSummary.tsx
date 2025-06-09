
import React from 'react';

interface PaymentSummaryProps {
  totalFees: number;
  deposit: number;
  totalPaid: number;
  balanceRemaining: number;
  pendingAmount?: number;
  formatAmount: (amount: number) => string;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ 
  totalFees, 
  deposit, 
  totalPaid, 
  balanceRemaining,
  pendingAmount = 0,
  formatAmount 
}) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
      <div>
        <p className="text-muted-foreground text-sm">Total Fees</p>
        <p className="text-lg font-semibold">{formatAmount(totalFees)}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm">Security Deposit</p>
        <p className="text-lg font-semibold">{formatAmount(deposit)}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm">Amount Paid (Approved)</p>
        <p className="text-lg font-semibold text-green-600">{formatAmount(totalPaid)}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm">Pending Approval</p>
        <p className="text-lg font-semibold text-orange-600">{formatAmount(pendingAmount)}</p>
      </div>
      <div className="col-span-2">
        <p className="text-muted-foreground text-sm">Balance Remaining</p>
        <p className={`text-lg font-semibold ${balanceRemaining > 0 ? 'text-red-500' : 'text-green-600'}`}>
          {formatAmount(balanceRemaining)}
        </p>
      </div>
    </div>
  );
};

export default PaymentSummary;
