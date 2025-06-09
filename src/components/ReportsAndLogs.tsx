
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart2, FileText, Download, Calendar, User, CreditCard, FilePen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format as formatDate, subDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useData } from '@/context/DataContext';
import { 
  exportToCSV, 
  exportToPDF, 
  exportToExcel,
  prepareOccupancyData, 
  prepareStudentData, 
  preparePaymentData
} from '@/utils/exportUtils';

// Define audit log entry type
interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: Date;
  details: string;
}

// Mock audit logs for demonstration
const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "1",
    userId: "1",
    userName: "Admin User",
    action: "CREATE",
    entity: "PG",
    entityId: "1",
    timestamp: new Date(),
    details: "Created new PG 'Sunshine PG'"
  },
  {
    id: "2",
    userId: "1",
    userName: "Admin User",
    action: "UPDATE",
    entity: "PG",
    entityId: "1",
    timestamp: subDays(new Date(), 1),
    details: "Updated PG details for 'Sunshine PG'"
  },
  {
    id: "3",
    userId: "2",
    userName: "Restay Manager",
    action: "CREATE",
    entity: "STUDENT",
    entityId: "101",
    timestamp: subDays(new Date(), 2),
    details: "Added new student 'Rahul Sharma'"
  },
  {
    id: "4",
    userId: "2",
    userName: "Restay Manager",
    action: "CREATE",
    entity: "PAYMENT",
    entityId: "201",
    timestamp: subDays(new Date(), 2),
    details: "Recorded payment of ₹8000 for student 'Rahul Sharma'"
  },
  {
    id: "5",
    userId: "1",
    userName: "Admin User",
    action: "UPDATE",
    entity: "ROOM",
    entityId: "301",
    timestamp: subDays(new Date(), 3),
    details: "Updated room details for Room #301"
  },
  {
    id: "6",
    userId: "3",
    userName: "Jane Doe",
    action: "DELETE",
    entity: "PAYMENT",
    entityId: "202",
    timestamp: subDays(new Date(), 3),
    details: "Deleted payment record for student 'Priya Patel'"
  },
  {
    id: "7",
    userId: "1",
    userName: "Admin User",
    action: "UPDATE",
    entity: "SETTINGS",
    entityId: "1",
    timestamp: subDays(new Date(), 4),
    details: "Updated system settings"
  },
];

// Define report types
enum ReportType {
  STUDENT_LIST = "student_list",
  ROOM_OCCUPANCY = "room_occupancy",
  PAYMENT_SUMMARY = "payment_summary",
  REVENUE_ANALYSIS = "revenue_analysis"
}

const ReportsAndLogs = () => {
  const { pgs, rooms } = useData();
  const [activeTab, setActiveTab] = useState("reports");
  const [selectedReportType, setSelectedReportType] = useState<ReportType>(ReportType.STUDENT_LIST);
  const [selectedPG, setSelectedPG] = useState<string>("all");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [logFilter, setLogFilter] = useState("all");
  const { toast } = useToast();

  // Safely get valid PGs and rooms arrays with proper type checking
  const validPGs = Array.isArray(pgs) ? pgs.filter(pg => pg && typeof pg === 'object' && pg.id && pg.name) : [];
  const validRooms = Array.isArray(rooms) ? rooms.filter(room => room && typeof room === 'object' && room.id) : [];

  // Filter data based on selected PG with comprehensive null checks
  const getFilteredData = () => {
    const filteredRooms = selectedPG === "all" 
      ? validRooms 
      : validRooms.filter(room => {
          return room && room.pgId && typeof room.pgId === 'string' && room.pgId === selectedPG;
        });
    
    const allStudents = filteredRooms.flatMap(room => {
      if (!room || !Array.isArray(room.students)) {
        return [];
      }
      
      return room.students.filter(student => student && typeof student === 'object').map(student => {
        const pgName = validPGs.find(pg => pg && pg.id === room.pgId)?.name || 'Unknown';
        return {
          ...student,
          roomNumber: room.number || 'Unknown',
          pgName: pgName
        };
      });
    });
    
    const allPayments = allStudents.flatMap(student => {
      if (!student || !Array.isArray(student.payments)) {
        return [];
      }
      
      return student.payments.filter(payment => payment && typeof payment === 'object').map(payment => ({
        ...payment,
        studentName: student.name || 'Unknown',
        roomNumber: student.roomNumber || 'Unknown',
        pgName: student.pgName || 'Unknown'
      }));
    });

    return { filteredRooms, allStudents, allPayments };
  };

  // Function to handle report download with real data
  const handleDownloadReport = (format: string) => {
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const { filteredRooms, allStudents, allPayments } = getFilteredData();
      
      let data: any[] = [];
      let headers: string[] = [];
      let title = '';
      let fileName = '';
      
      switch (selectedReportType) {
        case ReportType.STUDENT_LIST:
          data = allStudents.map(student => ({
            name: student.name || '',
            room: student.roomNumber || '',
            pg: student.pgName || '',
            phone: student.phone || '',
            total_fees: student.totalFees || 0,
            paid: (student.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0),
            balance: (student.totalFees || 0) - (student.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0),
            status: (student.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0) >= (student.totalFees || 0) ? 'Paid' : 'Pending'
          }));
          headers = ['Name', 'Room', 'PG', 'Phone', 'Total Fees', 'Paid', 'Balance', 'Status'];
          title = 'Student List';
          fileName = `student-list-${dateStr}`;
          break;
        
        case ReportType.ROOM_OCCUPANCY:
          data = filteredRooms.map(room => {
            const pgName = validPGs.find(pg => pg && pg.id === room.pgId)?.name || 'Unknown';
            return {
              pg: pgName,
              room: room.number || '',
              capacity: room.capacity || 0,
              occupied: Array.isArray(room.students) ? room.students.length : 0,
              rate: room.capacity > 0 ? `${Math.round(((Array.isArray(room.students) ? room.students.length : 0) / room.capacity) * 100)}%` : '0%',
              status: room.status || 'available'
            };
          });
          headers = ['PG', 'Room', 'Capacity', 'Occupied', 'Rate', 'Status'];
          title = 'Room Occupancy';
          fileName = `room-occupancy-${dateStr}`;
          break;
        
        case ReportType.PAYMENT_SUMMARY:
          const monthlyData = allPayments.reduce((acc: any, payment) => {
            // Ensure we have a valid date
            let paymentDate: Date;
            if (payment.date) {
              paymentDate = new Date(payment.date);
              // Check if date is valid
              if (isNaN(paymentDate.getTime())) {
                paymentDate = new Date();
              }
            } else {
              paymentDate = new Date();
            }
            
            const month = formatDate(paymentDate, 'MMMM yyyy');
            if (!acc[month]) {
              acc[month] = { total: 0, count: 0 };
            }
            acc[month].total += payment.amount || 0;
            acc[month].count += 1;
            return acc;
          }, {});
          
          data = Object.entries(monthlyData).map(([month, monthData]: [string, any]) => ({
            month,
            total_collected: monthData.total || 0,
            payment_count: monthData.count || 0,
            average_payment: monthData.count > 0 ? Math.round((monthData.total || 0) / monthData.count) : 0
          }));
          headers = ['Month', 'Total Collected', 'Payment Count', 'Average Payment'];
          title = 'Payment Summary';
          fileName = `payment-summary-${dateStr}`;
          break;
        
        case ReportType.REVENUE_ANALYSIS:
          const pgRevenue = validPGs.map(pg => {
            const pgRooms = validRooms.filter(room => room && room.pgId === pg.id);
            const pgPayments = pgRooms.flatMap(room => {
              if (!room || !Array.isArray(room.students)) return [];
              return room.students.flatMap(student => 
                Array.isArray(student.payments) ? student.payments : []
              );
            });
            const totalRevenue = pgPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
            const totalStudents = pgRooms.reduce((sum, room) => {
              if (!room || !Array.isArray(room.students)) return sum;
              return sum + room.students.length;
            }, 0);
            
            return {
              pg_name: pg.name || '',
              total_revenue: totalRevenue,
              total_students: totalStudents,
              average_per_student: totalStudents > 0 ? Math.round(totalRevenue / totalStudents) : 0,
              total_rooms: pgRooms.length
            };
          });
          
          data = pgRevenue;
          headers = ['PG Name', 'Total Revenue', 'Total Students', 'Average per Student', 'Total Rooms'];
          title = 'Revenue Analysis';
          fileName = `revenue-analysis-${dateStr}`;
          break;
      }
      
      // Export based on format
      switch (format) {
        case 'excel':
          exportToExcel(data, fileName);
          break;
        
        case 'pdf':
          exportToPDF(
            headers,
            data,
            `${title} (${selectedPG !== 'all' ? validPGs.find(pg => pg && pg.id === selectedPG)?.name || 'Unknown PG' : 'All PGs'})`,
            fileName
          );
          break;
          
        default:
          exportToCSV(data, fileName);
      }
      
      toast({
        title: "Export successful",
        description: `Report has been downloaded as ${format.toUpperCase()} with real data`,
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

  // Function to handle report generation
  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGeneratingReport(false);
    }, 1500);
  };
  
  // Function to handle log filtering
  const handleLogFilter = (filter: string) => {
    setLogFilter(filter);
    
    if (filter === 'all') {
      setFilteredLogs(mockAuditLogs);
    } else {
      setFilteredLogs(mockAuditLogs.filter(log => log.entity === filter.toUpperCase()));
    }
  };

  // Helper function to get action style
  const getActionStyle = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Reports
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FilePen className="h-4 w-4" /> System Logs
          </TabsTrigger>
        </TabsList>
        
        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Generate Reports from Connected Data
              </CardTitle>
              <CardDescription>
                Generate detailed reports using real data from your PGs, rooms, students, and payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Report Type</label>
                  <Select 
                    value={selectedReportType} 
                    onValueChange={(value) => setSelectedReportType(value as ReportType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ReportType.STUDENT_LIST}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Student List</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={ReportType.ROOM_OCCUPANCY}>
                        <div className="flex items-center gap-2">
                          <BarChart2 className="h-4 w-4" />
                          <span>Room Occupancy</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={ReportType.PAYMENT_SUMMARY}>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Payment Summary</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={ReportType.REVENUE_ANALYSIS}>
                        <div className="flex items-center gap-2">
                          <BarChart2 className="h-4 w-4" />
                          <span>Revenue Analysis</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Select PG</label>
                  <Select 
                    value={selectedPG} 
                    onValueChange={(value) => setSelectedPG(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select PG" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All PGs ({validPGs.length})</SelectItem>
                      {validPGs.map(pg => (
                        <SelectItem key={pg.id} value={pg.id}>{pg.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Date Range</label>
                  <Select defaultValue="this_month">
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this_month">This Month</SelectItem>
                      <SelectItem value="last_month">Last Month</SelectItem>
                      <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                      <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                      <SelectItem value="this_year">This Year</SelectItem>
                      <SelectItem value="all_time">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg mt-6">
                <h3 className="text-base font-medium mb-2">Data Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total PGs:</span>
                    <span className="ml-2 font-medium">{validPGs.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Rooms:</span>
                    <span className="ml-2 font-medium">{validRooms.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Students:</span>
                    <span className="ml-2 font-medium">
                      {validRooms.reduce((sum, room) => sum + (Array.isArray(room.students) ? room.students.length : 0), 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Payments:</span>
                    <span className="ml-2 font-medium">
                      {validRooms.reduce((sum, room) => 
                        sum + (Array.isArray(room.students) ? room.students.reduce((studentSum, student) => 
                          studentSum + (Array.isArray(student.payments) ? student.payments.length : 0), 0) : 0), 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between flex-wrap gap-4">
              <div className="space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => handleDownloadReport('excel')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" /> Excel
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleDownloadReport('pdf')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" /> PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleDownloadReport('csv')}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" /> CSV
                </Button>
              </div>
              <Button 
                onClick={() => setIsGeneratingReport(!isGeneratingReport)}
                disabled={isGeneratingReport}
              >
                {isGeneratingReport ? "Generating..." : "Generate Report"}
              </Button>
            </CardFooter>
          </Card>

          {/* Report Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Report Templates</CardTitle>
              <CardDescription>
                Quickly access your frequently used report configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Monthly Occupancy</CardTitle>
                    <CardDescription className="text-xs">Last saved: 2 days ago</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2 text-sm">
                    <p className="text-muted-foreground">Room occupancy report for all PGs</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full">Load Template</Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Payment Collection</CardTitle>
                    <CardDescription className="text-xs">Last saved: 1 week ago</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2 text-sm">
                    <p className="text-muted-foreground">Monthly payment summary by PG</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full">Load Template</Button>
                  </CardFooter>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Revenue Dashboard</CardTitle>
                    <CardDescription className="text-xs">Last saved: 3 days ago</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2 text-sm">
                    <p className="text-muted-foreground">Quarterly revenue analysis</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full">Load Template</Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FilePen className="h-5 w-5" />
                System Audit Logs
              </CardTitle>
              <CardDescription>
                Track all actions performed in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                <Button 
                  variant={logFilter === "all" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleLogFilter("all")}
                >
                  All Logs
                </Button>
                <Button 
                  variant={logFilter === "pg" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleLogFilter("pg")}
                >
                  PG Changes
                </Button>
                <Button 
                  variant={logFilter === "student" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleLogFilter("student")}
                >
                  Student Records
                </Button>
                <Button 
                  variant={logFilter === "payment" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleLogFilter("payment")}
                >
                  Payment Logs
                </Button>
                <Button 
                  variant={logFilter === "settings" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleLogFilter("settings")}
                >
                  Settings Changes
                </Button>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No logs found for the selected filter.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => {
                        // Ensure timestamp is a valid Date object
                        const timestamp = log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp);
                        
                        return (
                          <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{formatDate(timestamp, 'dd MMM yyyy, HH:mm')}</span>
                              </div>
                            </TableCell>
                            <TableCell>{log.userName}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionStyle(log.action)}`}>
                                {log.action}
                              </span>
                            </TableCell>
                            <TableCell>{log.entity}</TableCell>
                            <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredLogs.length} logs
              </p>
              <div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" /> Export Logs
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsAndLogs;
