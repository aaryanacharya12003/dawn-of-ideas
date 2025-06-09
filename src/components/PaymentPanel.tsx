
import React from 'react';
import { Student, PaymentMode } from '@/types';
import { PaymentFormValues } from './payment/paymentFormSchema';
import PaymentForm from './payment/PaymentForm';
import PaymentHistory from './payment/PaymentHistory';
import PaymentSummary from './payment/PaymentSummary';
import StudentPaymentInfo from './payment/StudentPaymentInfo';
import { formatIndianCurrency } from '@/utils/formatCurrency';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

interface PaymentPanelProps {
  student: Student;
  onAddPayment: (studentId: string, payment: { date: Date; amount: number; mode: PaymentMode; note: string }) => void;
  disabled?: boolean;
}

const PaymentPanel: React.FC<PaymentPanelProps> = ({ student, onAddPayment, disabled = false }) => {
  const { user } = useAuth();
  const { pgs, rooms } = useData();
  
  const totalPaid = student.payments
    .filter(payment => payment.approvalStatus === 'approved')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = student.payments
    .filter(payment => payment.approvalStatus === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const balanceRemaining = student.totalFees - totalPaid;

  // Find the PG and room information
  const studentPG = pgs.find(pg => pg.id === student.pgId);
  const studentRoom = rooms.find(room => room.id === student.roomId);

  const handleSubmit = (data: PaymentFormValues) => {
    // Ensure all required fields are explicitly passed
    onAddPayment(student.id, {
      date: data.date,
      amount: data.amount,
      mode: data.mode,
      note: data.note || '', // Provide default empty string if note is undefined
    });
  };

  const showAddedBy = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-lg font-semibold">Payment Details - {student.name}</h3>
          <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
              PG: {studentPG?.name || "Not assigned"}
            </span>
            <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
              Room: {studentRoom?.number || "Not assigned"}
            </span>
          </div>
        </div>
        
        <StudentPaymentInfo student={student} />
        
        <PaymentSummary 
          totalFees={student.totalFees}
          deposit={student.deposit}
          totalPaid={totalPaid}
          balanceRemaining={balanceRemaining}
          formatAmount={formatIndianCurrency}
          pendingAmount={pendingAmount}
        />
        
        <PaymentHistory 
          payments={student.payments} 
          formatAmount={formatIndianCurrency} 
          showApprovalStatus={true}
          showAddedBy={showAddedBy}
        />
        
        <div>
          <h4 className="font-medium mb-4">Add Payment</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> All payments require accountant verification before being approved.
            </p>
          </div>
          <PaymentForm onSubmit={handleSubmit} disabled={disabled} />
        </div>
      </div>
    </div>
  );
};

export default PaymentPanel;
