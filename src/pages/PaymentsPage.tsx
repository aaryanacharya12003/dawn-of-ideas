import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PaymentPanel from '@/components/PaymentPanel';
import PaymentHistory from '@/components/payment/PaymentHistory';
import RecordPaymentForm from '@/components/RecordPaymentForm';
import DashboardHeader from '@/components/DashboardHeader';
import { formatIndianCurrency } from '@/utils/formatCurrency';
import { BuildingIcon, CreditCardIcon, UsersIcon, IndianRupeeIcon, AlertCircleIcon, CheckCircleIcon, ClockIcon, PlusIcon } from 'lucide-react';

const PaymentsPage: React.FC = () => {
  const { pgs, students, addPayment } = useData();
  const { user } = useAuth();
  const [selectedPG, setSelectedPG] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [showRecordPayment, setShowRecordPayment] = useState(false);

  console.log('PaymentsPage: Current user:', user?.role, user?.email);
  console.log('PaymentsPage: Available PGs:', pgs.length, pgs.map(pg => ({ id: pg.id, name: pg.name })));
  console.log('PaymentsPage: Available students:', students.length, students.map(s => ({ id: s.id, name: s.name, pgId: s.pgId, payments: s.payments?.length || 0 })));
  console.log('PaymentsPage: Selected PG filter:', selectedPG);

  // Filter students based on selected PG and user role
  const filteredStudents = useMemo(() => {
    console.log('PaymentsPage: Filtering students...');
    let filtered = students;

    // Apply PG filter if selected
    if (selectedPG !== 'all') {
      const beforeFilter = filtered.length;
      filtered = filtered.filter(student => student.pgId === selectedPG);
      console.log('PaymentsPage: Filtered by PG:', selectedPG, 'Before:', beforeFilter, 'After:', filtered.length);
    }
    
    console.log('PaymentsPage: Final filtered students:', filtered.length);
    filtered.forEach(student => {
      console.log(`  - Student: ${student.name}, PG: ${student.pgId}, Payments: ${student.payments?.length || 0}`);
    });
    
    return filtered;
  }, [students, selectedPG]);

  // Calculate payment statistics
  const paymentStats = useMemo(() => {
    console.log('PaymentsPage: Calculating payment stats for', filteredStudents.length, 'students');
    
    const allPayments = filteredStudents.flatMap(student => {
      const payments = student.payments || [];
      console.log(`PaymentsPage: Student ${student.name} has ${payments.length} payments`);
      return payments.map(payment => ({
        ...payment,
        studentName: student.name,
        studentId: student.id,
        pgName: pgs.find(pg => pg.id === student.pgId)?.name || 'Unknown PG'
      }));
    });

    console.log('PaymentsPage: Total payments found:', allPayments.length);
    allPayments.forEach((payment, index) => {
      console.log(`  Payment ${index + 1}: ${payment.studentName} - ₹${payment.amount} - ${payment.approvalStatus || 'pending'}`);
    });

    const verifiedPayments = allPayments.filter(p => p.approvalStatus === 'approved');
    const pendingPayments = allPayments.filter(p => p.approvalStatus === 'pending' || !p.approvalStatus);
    const rejectedPayments = allPayments.filter(p => p.approvalStatus === 'rejected');

    const totalRevenue = verifiedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const pendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalExpected = filteredStudents.reduce((sum, student) => sum + student.totalFees, 0);

    const stats = {
      totalPayments: allPayments.length,
      verifiedPayments: verifiedPayments.length,
      pendingPayments: pendingPayments.length,
      rejectedPayments: rejectedPayments.length,
      totalRevenue,
      pendingAmount,
      totalExpected,
      collectionRate: totalExpected > 0 ? Math.round((totalRevenue / totalExpected) * 100) : 0,
      payments: allPayments
    };

    console.log('PaymentsPage: Payment stats calculated:', {
      total: stats.totalPayments,
      verified: stats.verifiedPayments,
      pending: stats.pendingPayments,
      revenue: stats.totalRevenue,
      pendingAmount: stats.pendingAmount,
      collectionRate: stats.collectionRate
    });

    return stats;
  }, [filteredStudents, pgs]);

  // Get payment breakdown by PG
  const pgPaymentBreakdown = useMemo(() => {
    console.log('PaymentsPage: Calculating PG breakdown...');
    return pgs.map(pg => {
      const pgStudents = students.filter(student => student.pgId === pg.id);
      const pgPayments = pgStudents.flatMap(student => student.payments || []);
      
      const verified = pgPayments.filter(p => p.approvalStatus === 'approved');
      const pending = pgPayments.filter(p => p.approvalStatus === 'pending' || !p.approvalStatus);
      
      const breakdown = {
        pgId: pg.id,
        pgName: pg.name,
        totalStudents: pgStudents.length,
        totalPayments: pgPayments.length,
        verifiedCount: verified.length,
        pendingCount: pending.length,
        verifiedAmount: verified.reduce((sum, p) => sum + p.amount, 0),
        pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
        totalAmount: pgPayments.reduce((sum, p) => sum + p.amount, 0)
      };

      console.log('PaymentsPage: PG breakdown for', pg.name, ':', breakdown);
      return breakdown;
    });
  }, [pgs, students]);

  const isAccountant = user?.role === 'accountant';
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canManagePayments = isAdmin || isManager;

  const handleRecordPayment = async (studentId: string, paymentData: { date: Date; amount: number; mode: string; note: string }) => {
    try {
      console.log('PaymentsPage: Recording payment for student:', studentId, paymentData);
      await addPayment(studentId, paymentData);
      setShowRecordPayment(false);
      console.log('PaymentsPage: Payment recorded successfully');
    } catch (error) {
      console.error('PaymentsPage: Error recording payment:', error);
    }
  };

  if (pgs.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Payments</h1>
        <Card className="p-8 text-center">
          <BuildingIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No PGs Found</h3>
          <p className="text-muted-foreground">
            {isManager 
              ? 'You are not assigned to manage any PGs. Please contact an administrator.'
              : 'No PGs have been created yet. Create a PG first to manage payments.'
            }
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Payments Management</h1>
        
        <div className="flex items-center gap-4">
          {/* Record Payment Button for Admin and Manager */}
          {canManagePayments && (
            <Dialog open={showRecordPayment} onOpenChange={setShowRecordPayment}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Record New Payment</DialogTitle>
                </DialogHeader>
                <RecordPaymentForm
                  onSubmit={handleRecordPayment}
                  onCancel={() => setShowRecordPayment(false)}
                  students={filteredStudents}
                />
              </DialogContent>
            </Dialog>
          )}

          {/* PG Filter - show for admin/accountant or managers with multiple PGs */}
          {((isAdmin || isAccountant) || (isManager && pgs.length > 1)) && (
            <Select value={selectedPG} onValueChange={setSelectedPG}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select PG" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All PGs</SelectItem>
                {pgs.map((pg) => (
                  <SelectItem key={pg.id} value={pg.id}>
                    {pg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Dashboard Header with Stats */}
      <DashboardHeader pgId={selectedPG === 'all' ? undefined : selectedPG} />

      {/* Payment Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold">{paymentStats.totalPayments}</p>
              </div>
              <CreditCardIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-green-600">{paymentStats.verifiedPayments}</p>
                <p className="text-xs text-muted-foreground">{formatIndianCurrency(paymentStats.totalRevenue)}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Verification</p>
                <p className="text-2xl font-bold text-orange-600">{paymentStats.pendingPayments}</p>
                <p className="text-xs text-muted-foreground">{formatIndianCurrency(paymentStats.pendingAmount)}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold">{paymentStats.collectionRate}%</p>
                <p className="text-xs text-muted-foreground">of expected revenue</p>
              </div>
              <IndianRupeeIcon className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-pg">By PG</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          {canManagePayments && (
            <TabsTrigger value="record">Record Payment</TabsTrigger>
          )}
          {isAccountant && (
            <TabsTrigger value="verification">
              Verification Queue
              {paymentStats.pendingPayments > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {paymentStats.pendingPayments}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentHistory 
                payments={paymentStats.payments} 
                formatAmount={formatIndianCurrency}
                showApprovalStatus={true}
                showAddedBy={isAccountant || isAdmin}
                showApprovalActions={isAccountant}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-pg" className="mt-6">
          <div className="grid gap-4">
            {pgPaymentBreakdown.map((pg) => (
              <Card key={pg.pgId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{pg.pgName}</span>
                    <Badge variant="outline">{pg.totalStudents} students</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{pg.totalPayments}</p>
                      <p className="text-sm text-muted-foreground">Total Payments</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{pg.verifiedCount}</p>
                      <p className="text-sm text-muted-foreground">Verified</p>
                      <p className="text-xs text-green-600">{formatIndianCurrency(pg.verifiedAmount)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{pg.pendingCount}</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-xs text-orange-600">{formatIndianCurrency(pg.pendingAmount)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{formatIndianCurrency(pg.totalAmount)}</p>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <div className="grid gap-6">
            {filteredStudents.length === 0 ? (
              <Card className="p-8 text-center">
                <UsersIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
                <p className="text-muted-foreground">
                  {selectedPG === 'all' 
                    ? 'No students are currently registered.' 
                    : 'No students found for the selected PG.'
                  }
                </p>
              </Card>
            ) : (
              filteredStudents.map((student) => (
                <PaymentPanel
                  key={student.id}
                  student={student}
                  onAddPayment={async (studentId, paymentData) => {
                    console.log('PaymentsPage: Adding payment for student:', studentId, paymentData);
                    await addPayment(studentId, paymentData);
                  }}
                  disabled={!canManagePayments}
                />
              ))
            )}
          </div>
        </TabsContent>

        {canManagePayments && (
          <TabsContent value="record" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCardIcon className="h-5 w-5" />
                  Record New Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecordPaymentForm
                  onSubmit={handleRecordPayment}
                  onCancel={() => setActiveTab('overview')}
                  students={filteredStudents}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAccountant && (
          <TabsContent value="verification" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircleIcon className="h-5 w-5 text-orange-500" />
                  Payment Verification Queue
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">
                    {paymentStats.pendingPayments} pending
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentStats.pendingPayments === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-green-700 mb-2">All Caught Up!</h3>
                    <p className="text-muted-foreground">No pending payments require verification at this time.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <p className="text-sm text-orange-700">
                        <strong>{paymentStats.pendingPayments}</strong> payments totaling{' '}
                        <strong>{formatIndianCurrency(paymentStats.pendingAmount)}</strong> require verification.
                      </p>
                    </div>
                    
                    <PaymentHistory 
                      payments={paymentStats.payments.filter(p => p.approvalStatus === 'pending' || !p.approvalStatus)} 
                      formatAmount={formatIndianCurrency}
                      showApprovalStatus={true}
                      showAddedBy={true}
                      showApprovalActions={true}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default PaymentsPage;
