
import React from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Payment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { CheckCircle, XCircle } from 'lucide-react';

interface PaymentHistoryProps {
  payments: Payment[];
  formatAmount: (amount: number) => string;
  showApprovalStatus?: boolean;
  showAddedBy?: boolean;
  showApprovalActions?: boolean;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ 
  payments, 
  formatAmount, 
  showApprovalStatus = true,
  showAddedBy = false,
  showApprovalActions = false
}) => {
  const { user } = useAuth();
  const { approvePayment } = useData();
  
  const isAccountant = user?.role === 'accountant';
  const canApprove = isAccountant && showApprovalActions;

  const getApprovalStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">Pending Verification</Badge>;
    }
  };

  const handleApproval = async (paymentId: string, status: 'approved' | 'rejected') => {
    try {
      console.log("PaymentHistory: Approving payment", paymentId, "with status", status);
      await approvePayment(paymentId, status);
      console.log("PaymentHistory: Payment approval completed");
    } catch (error) {
      console.error("PaymentHistory: Error approving payment:", error);
    }
  };

  return (
    <div>
      <h4 className="font-medium mb-2">Transaction History</h4>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden sm:table-cell">Mode</TableHead>
              {showApprovalStatus && <TableHead className="hidden md:table-cell">Status</TableHead>}
              {showAddedBy && <TableHead className="hidden lg:table-cell">Added By</TableHead>}
              {canApprove && <TableHead className="hidden xl:table-cell">Actions</TableHead>}
              <TableHead className="hidden md:table-cell">Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No payment history available
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{format(new Date(payment.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="font-medium">{formatAmount(payment.amount)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{payment.mode}</TableCell>
                  {showApprovalStatus && (
                    <TableCell className="hidden md:table-cell">
                      {getApprovalStatusBadge(payment.approvalStatus)}
                    </TableCell>
                  )}
                  {showAddedBy && (
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {payment.addedByName || 'Unknown'}
                      </Badge>
                    </TableCell>
                  )}
                  {canApprove && (
                    <TableCell className="hidden xl:table-cell">
                      {(!payment.approvalStatus || payment.approvalStatus === 'pending') && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-green-600 hover:bg-green-50"
                            onClick={() => handleApproval(payment.id, 'approved')}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-red-600 hover:bg-red-50"
                            onClick={() => handleApproval(payment.id, 'rejected')}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="hidden md:table-cell">{payment.note || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PaymentHistory;
