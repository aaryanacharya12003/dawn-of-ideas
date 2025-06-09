import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { DashboardStats as DashboardStatsType, Room } from '@/types';
import { Button } from '@/components/ui/button';
import { CalendarIcon, PlusIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import AddRoomDialog from '@/components/AddRoomDialog';
import RoomDetailsModal from '@/components/RoomDetailsModal';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DashboardCharts from '@/components/DashboardCharts';
import RecentActivityFeed from '@/components/RecentActivityFeed';
import DashboardCalendar from '@/components/DashboardCalendar';

const Index = () => {
  const { 
    rooms, 
    pgs,
    students,
    getRoomStatus, 
    addStudent, 
    removeStudent, 
    addPayment, 
    addRoom,
    refreshAllData 
  } = useData();

  const { user } = useAuth();
  
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addRoomDialogOpen, setAddRoomDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPG, setSelectedPG] = useState("all");
  
  const today = new Date();
  const [dateRange, setDateRange] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: new Date(today.getFullYear(), today.getMonth(), 1),
    endDate: today
  });
  
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "analytics", label: "Analytics" },
    { id: "calendar", label: "Calendar" },
  ];

  // Refresh data when component mounts or when students data changes
  useEffect(() => {
    console.log("Dashboard: Students data updated, count:", students.length);
  }, [students]);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRoom(null);
  };

  const handleAddStudent = async (student: any) => {
    console.log("Dashboard: Adding student and refreshing data");
    await addStudent(student);
    // Data will automatically refresh through DataContext
  };

  const handleRemoveStudent = async (studentId: string) => {
    console.log("Dashboard: Removing student and refreshing data");
    await removeStudent(studentId);
    // Data will automatically refresh through DataContext
  };

  const handleAddPayment = async (payment: any) => {
    if (selectedRoom && selectedRoom.students && selectedRoom.students.length > 0) {
      const studentId = payment.studentId || (selectedRoom.students[0]?.id);
      if (studentId) {
        console.log("Dashboard: Adding payment and refreshing data");
        await addPayment(studentId, payment);
        // Data will automatically refresh through DataContext
      }
    }
  };

  const handleAddRoom = async (room: any) => {
    console.log("Dashboard: Adding room and refreshing data");
    await addRoom(room);
    // Data will automatically refresh through DataContext
  };

  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const dashboardStats = useMemo<DashboardStatsType>(() => {
    console.log("Dashboard: Calculating stats with students:", students.length, "rooms:", rooms.length);
    
    // Filter rooms based on selected PG
    const filteredRooms = selectedPG === "all" 
      ? rooms 
      : rooms.filter(room => room.pgId === selectedPG);

    // Add safety checks for room.students to prevent undefined errors
    const totalStudents = students.length;
    
    const roomsOccupied = filteredRooms.filter(room => (room.students?.length || 0) > 0).length;
    const totalRooms = filteredRooms.length;
    const occupancyRate = totalRooms > 0 ? Math.round((roomsOccupied / totalRooms) * 100) : 0;
    
    const allPayments = students.flatMap(student => student.payments || []);
    
    const totalFees = students.reduce((acc, student) => acc + (student.totalFees || 0), 0);
    
    const totalPaid = allPayments.reduce((acc, payment) => acc + (payment.amount || 0), 0);
    const pendingPayments = totalFees - totalPaid;
    
    const studentsWithDues = students.filter(student => {
      const paid = (student.payments || []).reduce((acc, payment) => acc + (payment.amount || 0), 0);
      return paid < (student.totalFees || 0);
    }).length;
    
    // Filter payments based on the selected date range
    const paymentsInRange = allPayments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return dateRange.startDate && dateRange.endDate && 
            paymentDate >= dateRange.startDate && 
            paymentDate <= dateRange.endDate;
    });
    
    const monthlyRevenue = paymentsInRange.reduce((acc, payment) => acc + (payment.amount || 0), 0);
    
    // Calculate revenue growth
    const revenueGrowth = 15000;  // Will be calculated properly in future
    const studentsGrowth = 3;     // Will be calculated properly in future
    
    console.log("Dashboard: Calculated stats:", {
      totalStudents,
      roomsOccupied,
      totalRooms,
      occupancyRate,
      pendingPayments,
      studentsWithDues,
      monthlyRevenue
    });
    
    return {
      totalStudents,
      studentsGrowth,
      roomsOccupied,
      totalRooms,
      occupancyRate,
      pendingPayments,
      studentsWithDues,
      monthlyRevenue,
      revenueGrowth
    };
  }, [rooms, students, selectedPG, dateRange]);

  return (
    <>
      {/* Header Section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">
            {getGreeting()}, {user?.name || 'Admin'} 👋
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Select defaultValue={selectedPG} onValueChange={setSelectedPG}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All PGs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All PGs</SelectItem>
                {pgs.map(pg => (
                  <SelectItem key={pg.id} value={pg.id}>{pg.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
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
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      const lastThirtyDays = new Date();
                      lastThirtyDays.setDate(today.getDate() - 30);
                      setDateRange({
                        startDate: lastThirtyDays,
                        endDate: today
                      });
                    }}
                  >
                    Last 30 Days
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList>
            {tabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* KPI Summary Cards */}
            <DashboardStats stats={dashboardStats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Analytics Charts Section */}
              <div className="lg:col-span-2 space-y-6">
                <DashboardCharts />
              </div>
              
              {/* Recent Activity Feed */}
              <div className="space-y-6">
                <RecentActivityFeed />
                
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Detailed Analytics</h2>
                <DashboardCharts showExtended={true} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
                <DashboardCalendar />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {selectedRoom && (
        <RoomDetailsModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          room={selectedRoom}
          roomStatus={getRoomStatus(selectedRoom)}
          onAddStudent={handleAddStudent}
          onRemoveStudent={handleRemoveStudent}
          onAddPayment={handleAddPayment}
        />
      )}
      
      <AddRoomDialog
        isOpen={addRoomDialogOpen}
        onClose={() => setAddRoomDialogOpen(false)}
        onAddRoom={handleAddRoom}
      />
    </>
  );
};

export default Index;
