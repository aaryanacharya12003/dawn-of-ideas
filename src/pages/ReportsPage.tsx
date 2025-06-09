import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageTabs from '@/components/PageTabs';
import { useData } from '@/context/DataContext';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReportsSummary from '@/components/reports/ReportsSummary';
import { useToast } from '@/hooks/use-toast';
import { 
  exportToCSV, 
  exportToExcel,
  exportToPDF, 
  prepareOccupancyData, 
  prepareStudentData, 
  preparePaymentData, 
  prepareFinancialData,
  downloadJsonData
} from '@/utils/exportUtils';

const ReportsPage = () => {
  const { rooms, pgs } = useData();
  const [activeTab, setActiveTab] = useState("financial");
  const [selectedPG, setSelectedPG] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const tabs = [
    { id: "financial", label: "Financial Reports" },
    { id: "occupancy", label: "Occupancy Reports" },
    { id: "student", label: "Student Reports" },
    { id: "export", label: "Export Data" },
  ];

  // Get all students across rooms for reports
  const allStudents = rooms.flatMap(room => room.students);
  
  // Filter students based on selected PG
  const filteredStudents = selectedPG === 'all' 
    ? allStudents 
    : allStudents.filter(student => {
        const studentRoom = rooms.find(room => room.id === student.roomId);
        return studentRoom?.pgId === selectedPG;
      });

  // Get all payments for financial reports
  const allPayments = filteredStudents.flatMap(student => student.payments || []);

  const handleExport = (type: string, format: string = 'excel') => {
    try {
      toast({
        title: "Preparing export",
        description: `Preparing ${type} report in ${format} format...`,
      });

      let exportData: any[] = [];
      let headers: string[] = [];
      let fileName = `${type}-report-${new Date().toISOString().split('T')[0]}`;

      switch (type) {
        case 'financial':
          const financialData = prepareFinancialData(filteredStudents);
          exportData = financialData.detailed;
          headers = ['Student ID', 'Date', 'Amount', 'Mode', 'Note'];
          fileName = 'financial-report';
          break;
        
        case 'occupancy':
          exportData = prepareOccupancyData(rooms);
          headers = ['Room Number', 'Capacity', 'Occupied', 'Available', 'Occupancy Rate'];
          fileName = 'occupancy-report';
          break;
        
        case 'students':
          exportData = prepareStudentData(filteredStudents);
          headers = ['Name', 'Phone', 'Address', 'Occupation', 'Total Fees', 'Deposit', 'Start Date', 'End Date', 'Room Number'];
          fileName = 'student-report';
          break;
        
        case 'payments':
          exportData = preparePaymentData(allPayments);
          headers = ['Student ID', 'Student Name', 'Room Number', 'Date', 'Amount', 'Mode', 'Note'];
          fileName = 'payment-report';
          break;
        
        case 'duelist':
          const dueList = filteredStudents
            .map(student => {
              const paid = student.payments ? student.payments.reduce((sum, p) => sum + p.amount, 0) : 0;
              const pending = student.totalFees - paid;
              
              if (pending > 0) {
                return {
                  student_name: student.name,
                  room_number: rooms.find(r => r.id === student.roomId)?.number || 'Unknown',
                  total_fees: student.totalFees,
                  paid_amount: paid,
                  pending_amount: pending,
                  phone: student.phone
                };
              }
              return null;
            })
            .filter(item => item !== null) as any[];
          
          exportData = dueList;
          headers = ['Student Name', 'Room Number', 'Total Fees', 'Paid Amount', 'Pending Amount', 'Phone'];
          fileName = 'pending-dues';
          break;
        
        case 'complete':
          downloadJsonData({
            rooms: rooms,
            students: filteredStudents,
            payments: allPayments,
          }, 'complete-export');
          
          toast({
            title: "Export successful",
            description: "Complete data exported as JSON file",
          });
          
          return;
      }

      // Export based on format
      switch (format) {
        case 'excel':
          exportToExcel(exportData, fileName);
          break;
        case 'pdf':
          exportToPDF(headers, exportData, `${fileName.toUpperCase()} (${new Date().toLocaleDateString()})`, fileName);
          break;
        case 'csv':
          exportToCSV(exportData, fileName);
          break;
      }

      toast({
        title: "Export successful",
        description: `${type} report has been exported as ${format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "An error occurred while exporting the report",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Select value={selectedPG} onValueChange={setSelectedPG}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select PG" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All PGs</SelectItem>
            {pgs.map(pg => (
              <SelectItem key={pg.id} value={pg.id}>{pg.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PageTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "financial" && (
        <div className="mt-6">
          <ReportsSummary students={filteredStudents} />
        </div>
      )}

      {activeTab === "occupancy" && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">PG Occupancy Breakdown</h2>
                
                <div className="space-y-4">
                  {pgs.map(pg => {
                    const pgRooms = rooms.filter(room => room.pgId === pg.id);
                    const totalBeds = pgRooms.reduce((sum, room) => sum + room.capacity, 0);
                    const occupiedBeds = pgRooms.reduce((sum, room) => sum + room.students.length, 0);
                    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
                    
                    return (
                      <div key={pg.id} className="border p-4 rounded">
                        <h3 className="font-medium">{pg.name}</h3>
                        <div className="grid grid-cols-3 mt-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Rooms</p>
                            <p className="font-medium">{pgRooms.length}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Occupancy</p>
                            <p className="font-medium">{occupiedBeds}/{totalBeds} beds</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Rate</p>
                            <p className="font-medium">{occupancyRate}%</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Upcoming Vacancies</h2>
                <Calendar 
                  mode="single" 
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "student" && (
        <div className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Student Demographics</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border p-4 rounded">
                    <h3 className="font-medium">Student Count by PG</h3>
                    <div className="mt-2 space-y-2">
                      {pgs.map(pg => {
                        const studentCount = allStudents.filter(student => {
                          const studentRoom = rooms.find(room => room.id === student.roomId);
                          return studentRoom?.pgId === pg.id;
                        }).length;
                        
                        return (
                          <div key={pg.id} className="flex justify-between">
                            <p>{pg.name}</p>
                            <p className="font-medium">{studentCount} students</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="border p-4 rounded">
                    <h3 className="font-medium">Lease Status</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <p>Lease Ending This Month</p>
                        <p className="font-medium">
                          {allStudents.filter(student => {
                            const endDate = new Date(student.endDate);
                            return endDate.getMonth() === new Date().getMonth() && 
                                   endDate.getFullYear() === new Date().getFullYear();
                          }).length}
                        </p>
                      </div>
                      <div className="flex justify-between">
                        <p>Lease Ending Next Month</p>
                        <p className="font-medium">
                          {allStudents.filter(student => {
                            const endDate = new Date(student.endDate);
                            const nextMonth = new Date();
                            nextMonth.setMonth(nextMonth.getMonth() + 1);
                            return endDate.getMonth() === nextMonth.getMonth() && 
                                   endDate.getFullYear() === nextMonth.getFullYear();
                          }).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "export" && (
        <div className="mt-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Export Reports</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => handleExport('financial')}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Financial Report</span>
                </Button>
                
                <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => handleExport('occupancy')}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Occupancy Report</span>
                </Button>
                
                <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => handleExport('students')}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Student Report</span>
                </Button>
                
                <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => handleExport('payments')}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Payment Report</span>
                </Button>
                
                <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => handleExport('duelist')}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Pending Dues List</span>
                </Button>
                
                <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => handleExport('complete')}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Complete Data Export</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default ReportsPage;
