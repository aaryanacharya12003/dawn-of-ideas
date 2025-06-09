
import { PaymentMode } from '@/types';

export const usePaymentOperations = (user: any, refreshAllData: () => Promise<void>) => {
  const handleApprovePayment = async (paymentId: string, status: 'approved' | 'rejected') => {
    if (!user?.id) {
      console.error("No user ID found for payment approval");
      return;
    }
    
    console.log("PaymentOperations: Approving payment:", paymentId, status, "by user:", user.id);
    
    try {
      // Handle demo users
      if (user?.id?.startsWith('demo-')) {
        console.log("Demo user detected, updating payment status in localStorage");
        
        const existingStudents = JSON.parse(localStorage.getItem('demo-students') || '[]');
        
        const updatedStudents = existingStudents.map((student: any) => {
          if (student.payments && Array.isArray(student.payments)) {
            const updatedPayments = student.payments.map((payment: any) => {
              if (payment.id === paymentId) {
                console.log("Updating payment status from", payment.approvalStatus, "to", status);
                return {
                  ...payment,
                  approvalStatus: status,
                  approvedBy: user.id,
                  approvedByName: user.name || 'Demo User',
                  approvedAt: new Date().toISOString()
                };
              }
              return payment;
            });
            
            return {
              ...student,
              payments: updatedPayments
            };
          }
          return student;
        });
        
        localStorage.setItem('demo-students', JSON.stringify(updatedStudents));
        console.log("Demo payment status updated, refreshing data...");
        await refreshAllData();
        return;
      }
      
      // Handle real users with database
      const { updatePaymentApproval } = await import('@/services/studentService');
      await updatePaymentApproval(paymentId, status, user.id);
      console.log("Real payment status updated, refreshing data...");
      await refreshAllData();
    } catch (error) {
      console.error("Error updating payment approval:", error);
      throw error;
    }
  };

  const handleGetPendingPayments = async () => {
    console.log("PaymentOperations: Getting pending payments for user:", user?.role);
    
    try {
      if (user?.id?.startsWith('demo-')) {
        console.log("Demo user detected, getting pending payments from localStorage");
        
        const existingStudents = JSON.parse(localStorage.getItem('demo-students') || '[]');
        
        const allPayments = existingStudents.flatMap((student: any) => {
          const payments = student.payments || [];
          return payments
            .filter((payment: any) => payment.approvalStatus === 'pending' || !payment.approvalStatus)
            .map((payment: any) => ({
              ...payment,
              studentName: student.name,
              studentId: student.id,
              pgName: 'Demo PG'
            }));
        });
        
        console.log("Found demo pending payments:", allPayments.length);
        return allPayments;
      }
      
      // Handle real users with database
      const { getPendingPayments } = await import('@/services/studentService');
      const pendingPayments = await getPendingPayments();
      console.log("Found real pending payments:", pendingPayments.length);
      return pendingPayments;
    } catch (error) {
      console.error("Error getting pending payments:", error);
      return [];
    }
  };

  const handleRecordPayment = async (studentId: string, paymentData: { date: Date; amount: number; mode: string; note: string }) => {
    console.log("PaymentOperations: Recording payment for student:", studentId);
    
    try {
      if (user?.id?.startsWith('demo-')) {
        console.log("Demo user detected, recording payment in localStorage");
        
        const existingStudents = JSON.parse(localStorage.getItem('demo-students') || '[]');
        
        const updatedStudents = existingStudents.map((student: any) => {
          if (student.id === studentId) {
            const newPayment = {
              id: `payment-${Date.now()}`,
              amount: paymentData.amount,
              date: paymentData.date.toISOString(),
              mode: paymentData.mode as PaymentMode,
              note: paymentData.note,
              approvalStatus: 'pending',
              addedBy: user.id,
              addedByName: user.name || 'Demo User',
              createdAt: new Date().toISOString()
            };
            
            return {
              ...student,
              payments: [...(student.payments || []), newPayment]
            };
          }
          return student;
        });
        
        localStorage.setItem('demo-students', JSON.stringify(updatedStudents));
        console.log("Demo payment recorded, refreshing data...");
        await refreshAllData();
        return;
      }
      
      // Handle real users with database
      const { addPayment } = await import('@/services/studentService');
      await addPayment({
        studentId,
        amount: paymentData.amount,
        date: paymentData.date,
        mode: paymentData.mode as PaymentMode,
        note: paymentData.note,
        addedBy: user.id,
        addedByName: user.name || 'Unknown User'
      });
      console.log("Real payment recorded, refreshing data...");
      await refreshAllData();
    } catch (error) {
      console.error("Error recording payment:", error);
      throw error;
    }
  };

  return {
    approvePayment: handleApprovePayment,
    getPendingPayments: handleGetPendingPayments,
    recordPayment: handleRecordPayment
  };
};
