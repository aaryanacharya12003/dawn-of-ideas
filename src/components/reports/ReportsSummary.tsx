
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatIndianCurrency } from '@/utils/formatCurrency';
import { Student } from '@/types';

interface ReportsSummaryProps {
  students: Student[];
}

const ReportsSummary: React.FC<ReportsSummaryProps> = ({ students }) => {
  // Calculate key financial metrics
  const totalFees = students.reduce((sum, student) => sum + student.totalFees, 0);
  const totalDeposits = students.reduce((sum, student) => sum + student.deposit, 0);
  const allPayments = students.flatMap(student => student.payments);
  const totalPaid = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = totalFees - totalPaid;
  
  // Payment modes distribution
  const paymentsByMode = allPayments.reduce((acc: Record<string, number>, payment) => {
    const mode = payment.mode;
    if (!acc[mode]) acc[mode] = 0;
    acc[mode] += payment.amount;
    return acc;
  }, {});
  
  // Calculate occupancy metrics
  const totalStudents = students.length;
  
  // Calculate pending dues by student
  const studentsWithDues = students.filter(student => {
    const paid = student.payments.reduce((sum, payment) => sum + payment.amount, 0);
    return paid < student.totalFees;
  });
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Financial Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatIndianCurrency(totalFees)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatIndianCurrency(totalDeposits)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatIndianCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">{formatIndianCurrency(pendingAmount)}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Mode Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(paymentsByMode).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(paymentsByMode).map(([mode, amount]) => (
                  <div key={mode} className="flex justify-between items-center">
                    <p>{mode}</p>
                    <p className="font-medium">{formatIndianCurrency(amount)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No payment data available</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Students with Pending Dues</CardTitle>
          </CardHeader>
          <CardContent>
            {studentsWithDues.length > 0 ? (
              <div className="space-y-3">
                {studentsWithDues.slice(0, 5).map(student => {
                  const paid = student.payments.reduce((sum, payment) => sum + payment.amount, 0);
                  const pending = student.totalFees - paid;
                  
                  return (
                    <div key={student.id} className="flex justify-between items-center">
                      <p>{student.name}</p>
                      <p className="font-medium text-red-500">{formatIndianCurrency(pending)}</p>
                    </div>
                  );
                })}
                {studentsWithDues.length > 5 && (
                  <p className="text-sm text-muted-foreground italic">
                    +{studentsWithDues.length - 5} more students with pending dues
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">All students have paid their dues</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsSummary;
