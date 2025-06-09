import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { CalendarIcon, BuildingIcon, MapPinIcon, PhoneIcon, PlusIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DashboardStats as DashboardStatsType } from '@/types';

import DashboardStats from '@/components/dashboard/DashboardStats';
import DashboardCharts from '@/components/DashboardCharts';
import RecentActivityFeed from '@/components/RecentActivityFeed';
import DashboardCalendar from '@/components/DashboardCalendar';
import RecordPaymentForm from '@/components/RecordPaymentForm';
import PaymentHistory from '@/components/payment/PaymentHistory';
import { formatIndianCurrency } from '@/utils/formatCurrency';

const RoleDashboard: React.FC = () => {
  const { 
    rooms, 
    pgs,
    students,
    addPayment,
    approvePayment,
    getRoomStatus, 
  } = useData();

  const { user } = useAuth();
  
  const [selectedPG, setSelectedPG] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  
  const today = new Date();
  const [dateRange, setDateRange] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: new Date(today.getFullYear(), today.getMonth(), 1),
    endDate: today
  });

  console.log('RoleDashboard: Current user:', user?.role, user?.email);
  console.log('RoleDashboard: Available data - Students:', students.length, 'Rooms:', rooms.length, 'PGs:', pgs.length);

  // Determine user capabilities
  const isAdmin = user?.role === 'admin';
  const isAccountant = user?.role === 'accountant';
  const isManager = user?.role === 'manager';
  const isViewer = user?.role === 'viewer';
  const canManagePayments = isAdmin || isManager;

  // Find managed PGs for managers and viewers
  const managedPGs = useMemo(() => {
    if (!isManager && !isViewer || !user) return pgs;
    
    console.log(`Finding managed PGs for ${user.role}:`, user.assignedPGs);
    
    if (user.assignedPGs && Array.isArray(user.assignedPGs) && user.assignedPGs.length > 0) {
      const managed = pgs.filter(pg => user.assignedPGs?.includes(pg.name));
      console.log(`${user.role}'s assigned PGs:`, managed);
      return managed;
    }
    
    const managedByID = pgs.filter(pg => pg.managerId === user.id);
    console.log(`${user.role}'s PGs by ID:`, managedByID);
    return managedByID;
  }, [pgs, user, isManager, isViewer]);

  // Available PGs for selection (all for admin/accountant, managed for manager/viewer)
  const availablePGs = (isManager || isViewer) ? managedPGs : pgs;

  // Filter data based on selected PG and user role
  const filteredData = useMemo(() => {
    console.log('RoleDashboard: Filtering data for role:', user?.role, 'selectedPG:', selectedPG);
    
    let filteredStudents = students;
    let filteredRooms = rooms;
    let filteredPGs = availablePGs;

    // Apply PG filter if selected
    if (selectedPG !== 'all') {
      filteredStudents = students.filter(student => student.pgId === selectedPG);
      filteredRooms = rooms.filter(room => room.pgId === selectedPG);
      filteredPGs = availablePGs.filter(pg => pg.id === selectedPG);
    }

    console.log('RoleDashboard: Filtered data - Students:', filteredStudents.length, 'Rooms:', filteredRooms.length, 'PGs:', filteredPGs.length);
    
    return { filteredStudents, filteredRooms, filteredPGs };
  }, [students, rooms, availablePGs, selectedPG, user?.role]);

  // Calculate payment statistics
  const paymentStats = useMemo<DashboardStatsType>(() => {
    const { filteredStudents, filteredRooms } = filteredData;
    
    console.log('RoleDashboard: Calculating payment stats...');

    const totalStudents = filteredStudents.length;
    const roomsOccupied = filteredRooms.filter(room => room.students?.length > 0).length;
    const totalRooms = filteredRooms.length;
    const occupancyRate = totalRooms > 0 ? Math.round((roomsOccupied / totalRooms) * 100) : 0;
    
    const allPayments = filteredStudents.flatMap(student => {
      const payments = student.payments || [];
      return payments.map(payment => ({
        ...payment,
        studentName: student.name,
        studentId: student.id,
        pgName: pgs.find(pg => pg.id === student.pgId)?.name || 'Unknown PG'
      }));
    });

    const verifiedPayments = allPayments.filter(p => p.approvalStatus === 'approved');
    const pendingPayments = allPayments.filter(p => p.approvalStatus === 'pending' || !p.approvalStatus);
    
    const totalFees = filteredStudents.reduce((sum, student) => sum + student.totalFees, 0);
    const totalRevenue = verifiedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const pendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const pendingDues = totalFees - totalRevenue;
    
    const studentsWithDues = filteredStudents.filter(student => {
      const paid = (student.payments || [])
        .filter(payment => payment.approvalStatus === 'approved')
        .reduce((sum, payment) => sum + payment.amount, 0);
      return paid < student.totalFees;
    }).length;
    
    // Filter payments based on date range
    const paymentsInRange = verifiedPayments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return dateRange.startDate && dateRange.endDate && 
             paymentDate >= dateRange.startDate && 
             paymentDate <= dateRange.endDate;
    });
    
    const monthlyRevenue = paymentsInRange.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Calculate revenue growth
    const previousPeriodStart = new Date(dateRange.startDate!);
    const previousPeriodEnd = new Date(dateRange.endDate!);
    const periodDuration = previousPeriodEnd.getTime() - previousPeriodStart.getTime();
    
    previousPeriodStart.setTime(previousPeriodStart.getTime() - periodDuration);
    previousPeriodEnd.setTime(previousPeriodEnd.getTime() - periodDuration);
    
    const previousPayments = verifiedPayments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= previousPeriodStart && paymentDate <= previousPeriodEnd;
    });
    
    const previousRevenue = previousPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const revenueGrowth = monthlyRevenue - previousRevenue;
    
    const studentsGrowth = 2; // Mock data for now

    console.log('RoleDashboard: Stats calculated - Revenue:', totalRevenue, 'Pending:', pendingAmount, 'Students:', totalStudents);

    return {
      totalStudents,
      studentsGrowth,
      roomsOccupied,
      totalRooms,
      occupancyRate,
      pendingPayments: pendingDues,
      studentsWithDues,
      monthlyRevenue,
      revenueGrowth,
      totalRevenue,
      pendingAmount,
      totalPayments: allPayments.length,
      verifiedPayments: verifiedPayments.length,
      pendingVerification: pendingPayments.length,
      payments: allPayments
    };
  }, [filteredData, pgs, dateRange]);

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'admin': return 'Admin';
      case 'accountant': return 'Accountant';
      case 'manager': return 'Manager';
      case 'viewer': return 'Viewer';
      default: return 'User';
    }
  };

  const handleRecordPayment = async (studentId: string, paymentData: { date: Date; amount: number; mode: string; note: string }) => {
    try {
      console.log('RoleDashboard: Recording payment for student:', studentId, paymentData);
      await addPayment(studentId, paymentData);
      setShowRecordPayment(false);
      console.log('RoleDashboard: Payment recorded successfully');
    } catch (error) {
      console.error('RoleDashboard: Error recording payment:', error);
    }
  };

  const handleApproval = async (paymentId: string, status: 'approved' | 'rejected') => {
    try {
      console.log("RoleDashboard: Approving payment", paymentId, "with status", status);
      await approvePayment(paymentId, status);
      console.log("RoleDashboard: Payment approval completed");
    } catch (error) {
      console.error("RoleDashboard: Error approving payment:", error);
    }
  };

  // Show no access message for managers/viewers without PGs
  if ((isManager || isViewer) && managedPGs.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">{getRoleTitle()} Dashboard</h1>
        <Card className="p-6">
          <div className="text-center">
            <BuildingIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No PG Assigned</h3>
            <p className="text-muted-foreground">
              You are not currently assigned to any PG. Please contact an administrator to get assigned to a PG.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "analytics", label: "Analytics" },
    { id: "calendar", label: "Calendar" },
  ];

  // Only add payments tab for non-viewers
  if (!isViewer) {
    tabs.push({ id: "payments", label: "Payments" });
  }

  // Add verification tab for accountants
  if (isAccountant) {
    tabs.push({ id: "verification", label: `Verification (${paymentStats.pendingVerification})` });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {getGreeting()}, {user?.name || getRoleTitle()} 👋
            </h1>
            <p className="text-muted-foreground">
              {((isManager || isViewer) && managedPGs.length > 0) 
                ? `Assigned to: ${managedPGs.map(pg => pg.name).join(', ')}`
                : `${getRoleTitle()} Dashboard`
              }
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Record Payment Button - only for Admin and Manager (not viewer) */}
            {canManagePayments && !isViewer && (
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
                    students={filteredData.filteredStudents}
                  />
                </DialogContent>
              </Dialog>
            )}

            {/* PG Filter */}
            {((isAdmin || isAccountant) || ((isManager || isViewer) && managedPGs.length > 1)) && (
              <Select value={selectedPG} onValueChange={setSelectedPG}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select PG" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All PGs</SelectItem>
                  {availablePGs.map((pg) => (
                    <SelectItem key={pg.id} value={pg.id}>
                      {pg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.startDate && dateRange.endDate ? (
                    <>
                      {format(dateRange.startDate, "dd MMM")} - {format(dateRange.endDate, "dd MMM, yyyy")}
                    </>
                  ) : (
                    <span>Select date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: dateRange.startDate,
                    to: dateRange.endDate,
                  }}
                  onSelect={(range) => 
                    setDateRange({
                      startDate: range?.from,
                      endDate: range?.to,
                    })
                  }
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
                <div className="p-3 border-t border-border flex justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                      setDateRange({
                        startDate: firstDay,
                        endDate: today
                      });
                    }}
                  >
                    This Month
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
                      setDateRange({
                        startDate: lastMonth,
                        endDate: lastMonthEnd
                      });
                    }}
                  >
                    Last Month
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="w-full md:w-auto">
            {tabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* KPI Summary Cards */}
            <DashboardStats stats={paymentStats} isManager={isManager || isViewer} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Analytics Charts Section */}
              <div className="lg:col-span-2 space-y-6">
                <DashboardCharts />
              </div>
              
              {/* Recent Activity Feed */}
              <div className="space-y-6">
                <RecentActivityFeed pgId={selectedPG === 'all' ? undefined : selectedPG} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Detailed Analytics</h2>
              <DashboardCharts showExtended={true} />
            </Card>
          </TabsContent>
          
          {!isViewer && (
            <TabsContent value="payments" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Management</CardTitle>
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
          )}
          
          <TabsContent value="calendar" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
              <DashboardCalendar />
            </Card>
          </TabsContent>

          {isAccountant && (
            <TabsContent value="verification" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Verification Queue</CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentHistory 
                    payments={paymentStats.payments.filter(p => p.approvalStatus === 'pending' || !p.approvalStatus)} 
                    formatAmount={formatIndianCurrency}
                    showApprovalStatus={true}
                    showAddedBy={true}
                    showApprovalActions={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default RoleDashboard;
