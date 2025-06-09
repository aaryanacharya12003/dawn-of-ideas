import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import PageTabs from '@/components/PageTabs';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Student } from '@/types';
import { format } from 'date-fns';
import { fetchStudents } from '@/services/studentService';
import { fetchRooms } from '@/services/roomService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Trash2 } from 'lucide-react';

const StudentsPage = () => {
  const { pgs, rooms: contextRooms, clearAllStudents } = useData();
  const [activeTab, setActiveTab] = useState("all");
  const [viewStudentId, setViewStudentId] = useState<string | null>(null);
  const [students, setStudents] = useState<(Student & {roomNumber?: string, pgName?: string})[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Helper function to check if a student is a demo student
  const isDemoStudent = (studentId: string): boolean => {
    return studentId.startsWith('student-') && /^student-\d+$/.test(studentId);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        let allStudents: Student[] = [];
        let allRooms: any[] = [];
        
        // For demo users, create some sample data if none exists
        if (user?.id?.startsWith('demo-')) {
          console.log('Loading demo data from context...');
          
          // Get students from localStorage first
          const demoStudents = JSON.parse(localStorage.getItem('demo-students') || '[]');
          console.log('Demo students from localStorage:', demoStudents);
          
          // Also get students from rooms in context
          const roomStudents = contextRooms.flatMap(room => 
            (room.students || []).map(student => ({
              ...student,
              roomId: room.id,
              pgId: room.pgId
            }))
          );
          
          // Combine and deduplicate students
          let allDemoStudents = [...demoStudents];
          roomStudents.forEach(roomStudent => {
            if (!allDemoStudents.find(s => s.id === roomStudent.id)) {
              allDemoStudents.push(roomStudent);
            }
          });

          allStudents = allDemoStudents;
          allRooms = contextRooms;
          
          console.log('All demo students found:', allStudents);
        } else {
          // For real users, fetch from database
          allStudents = await fetchStudents();
          allRooms = await fetchRooms();
        }
        
        // Map room numbers and PG names to students
        const studentsWithRoomInfo = allStudents.map(student => {
          const room = allRooms.find(room => room.id === student.roomId);
          const pg = student.pgId ? pgs.find(p => p.id === student.pgId) : null;
          
          return {
            ...student,
            roomNumber: room?.number || room?.room_number || 'N/A',
            pgName: pg?.name || 'N/A',
            pgId: pg?.id || student.pgId
          };
        });
        
        // Filter students based on user role and assigned PGs
        let filteredStudents = studentsWithRoomInfo;
        if (user && user.role === 'manager') {
          let assignedPgIds: string[] = [];
          
          if (user.assignedPGs && Array.isArray(user.assignedPGs) && user.assignedPGs.length > 0) {
            assignedPgIds = pgs
              .filter(pg => user.assignedPGs?.includes(pg.name))
              .map(pg => pg.id);
          } else {
            assignedPgIds = pgs
              .filter(pg => pg.managerId === user.id)
              .map(pg => pg.id);
          }
          
          filteredStudents = studentsWithRoomInfo.filter(student => 
            student.pgId && assignedPgIds.includes(student.pgId)
          );
        }
        
        setStudents(filteredStudents);
        console.log("Loaded students for user:", filteredStudents.length, filteredStudents);
      } catch (error) {
        console.error("Error loading students:", error);
        toast({
          title: "Error",
          description: "Failed to load students. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [pgs, toast, user, contextRooms]);

  const tabs = [
    { id: "all", label: "All Students" },
    { id: "active", label: "Active" },
    { id: "pending", label: "Pending Payments" },
    { id: "archived", label: "Archived" },
  ];

  const viewingStudent = viewStudentId ? 
    students.find(student => student.id === viewStudentId) : null;

  const handleAddStudentClick = () => {
    navigate('/add-student');
  };

  const handleViewStudent = (studentId: string) => {
    setViewStudentId(studentId);
  };

  const handleCloseDialog = () => {
    setViewStudentId(null);
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      console.log("StudentsPage: Deleting student:", studentId);
      
      // Check if this is a demo student or demo user
      if (user?.id?.startsWith('demo-') || isDemoStudent(studentId)) {
        console.log("Demo student detected, deleting from localStorage");
        
        // For demo students, remove from localStorage
        const demoStudents = JSON.parse(localStorage.getItem('demo-students') || '[]');
        const updatedStudents = demoStudents.filter((s: any) => s.id !== studentId);
        localStorage.setItem('demo-students', JSON.stringify(updatedStudents));
        
        // Update local state immediately
        setStudents(prevStudents => {
          const filtered = prevStudents.filter(s => s.id !== studentId);
          console.log("Local state updated, remaining students:", filtered.length);
          return filtered;
        });
        
        console.log("Demo student deleted from localStorage and state updated");
        
        toast({
          title: "Success",
          description: "Student deleted successfully.",
        });
      } else {
        // For real students, use the database service
        console.log("Real student detected, deleting from database");
        
        const { deleteStudent } = await import('@/services/studentService');
        const success = await deleteStudent(studentId);
        
        if (success) {
          // Update local state immediately
          setStudents(prevStudents => {
            const filtered = prevStudents.filter(s => s.id !== studentId);
            console.log("Local state updated after DB deletion, remaining students:", filtered.length);
            return filtered;
          });
          
          toast({
            title: "Success",
            description: "Student deleted successfully.",
          });
        } else {
          throw new Error("Failed to delete student from database");
        }
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to clear all student data
  const handleClearAllStudents = async () => {
    if (!window.confirm("Are you sure you want to delete ALL students and their data? This action cannot be undone and will remove all student records and payment history.")) {
      return;
    }

    try {
      console.log("Clearing all student data...");
      
      // Always clear demo students from localStorage first
      localStorage.removeItem('demo-students');
      console.log("Demo students cleared from localStorage");
      
      // Clear local state immediately
      setStudents([]);
      
      // For non-demo users, also clear database data
      if (!user?.id?.startsWith('demo-')) {
        console.log("Clearing database student data...");
        
        // Import and use the clearAllStudentData function directly
        const { clearAllStudentData } = await import('@/services/studentService');
        const success = await clearAllStudentData();
        
        if (!success) {
          throw new Error("Failed to clear database student data");
        }
        
        console.log("Database student data cleared successfully");
        
        // Also use the context function to ensure all data is cleared
        await clearAllStudents();
      }
      
      toast({
        title: "Success",
        description: "All student data has been cleared successfully.",
      });
    } catch (error) {
      console.error("Error clearing all student data:", error);
      toast({
        title: "Error",
        description: "Failed to clear all student data. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Check if user has permission to delete students (only admin)
  const hasDeletePermission = () => {
    return user?.role === 'admin';
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      );
    }
    
    // If manager has no assigned PGs or no students found
    if (user?.role === 'manager' && students.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-muted-foreground">No students found for your assigned PGs.</p>
        </div>
      );
    }
    
    switch (activeTab) {
      case "all":
        return renderStudentsList(students);
      case "active":
        return renderStudentsList(students.filter(student => {
          const today = new Date();
          return new Date(student.endDate) > today;
        }));
      case "pending":
        return renderStudentsList(students.filter(student => {
          const paid = student.payments.reduce((sum, payment) => sum + payment.amount, 0);
          return paid < student.totalFees;
        }));
      case "archived":
        return renderStudentsList(students.filter(student => {
          const today = new Date();
          return new Date(student.endDate) <= today;
        }));
      default:
        return null;
    }
  };

  const renderStudentsList = (studentsToRender: any[]) => {
    if (studentsToRender.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-muted-foreground">No students found in this category.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Room</th>
              <th className="px-4 py-3 text-left text-sm font-medium">PG</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
              <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">Occupation</th>
              <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">Total Fees</th>
              <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">Paid Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {studentsToRender.map((student) => {
              const paidAmount = (student.payments || []).reduce((sum: number, payment: any) => sum + payment.amount, 0);
              const isPaid = paidAmount >= student.totalFees;
              const isPartial = paidAmount > 0 && paidAmount < student.totalFees;
              
              return (
                <tr key={student.id}>
                  <td className="px-4 py-4 text-sm">{student.name}</td>
                  <td className="px-4 py-4 text-sm">{student.roomNumber}</td>
                  <td className="px-4 py-4 text-sm">{student.pgName}</td>
                  <td className="px-4 py-4 text-sm">{student.phone}</td>
                  <td className="px-4 py-4 text-sm hidden md:table-cell">{student.occupation}</td>
                  <td className="px-4 py-4 text-sm hidden lg:table-cell">₹{student.totalFees.toLocaleString()}</td>
                  <td className="px-4 py-4 text-sm hidden lg:table-cell">₹{paidAmount.toLocaleString()}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isPaid 
                        ? 'bg-green-100 text-green-800' 
                        : isPartial 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {isPaid ? 'Paid' : isPartial ? 'Partial' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewStudent(student.id)}>
                        View
                      </Button>
                      {hasDeletePermission() && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to permanently delete ${student.name}? This action cannot be undone.`)) {
                              handleDeleteStudent(student.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd/MM/yyyy');
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Students</h1>
        <div className="flex gap-2">
          {hasDeletePermission() && (
            <Button 
              variant="outline" 
              className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
              onClick={handleClearAllStudents}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Students
            </Button>
          )}
          <Button onClick={handleAddStudentClick}>Add New Student</Button>
        </div>
      </div>
      
      <PageTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      
      {renderTabContent()}
      
      {/* Student Details Dialog */}
      <Dialog open={Boolean(viewStudentId)} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Student Details</DialogTitle>
          </DialogHeader>
          
          {viewingStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Name:</span>
                    <span>{viewingStudent.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Phone:</span>
                    <span>{viewingStudent.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Occupation:</span>
                    <span>{viewingStudent.occupation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Aadhaar:</span>
                    <span>XXXX XXXX {viewingStudent.aadhaarNumber ? viewingStudent.aadhaarNumber.slice(-4) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Room Number:</span>
                    <span>{viewingStudent.roomNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">PG:</span>
                    <span>{viewingStudent.pgName}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Stay Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Start Date:</span>
                    <span>{formatDate(viewingStudent.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">End Date:</span>
                    <span>{formatDate(viewingStudent.endDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total Fees:</span>
                    <span>₹{viewingStudent.totalFees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Deposit:</span>
                    <span>₹{viewingStudent.deposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Paid Amount:</span>
                    <span>₹{viewingStudent.payments.reduce((sum: number, payment: any) => sum + payment.amount, 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {viewingStudent.address && (
                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Address</h3>
                  <p className="text-muted-foreground">{viewingStudent.address}</p>
                </div>
              )}
              
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-lg font-semibold mb-3">Payment History</h3>
                {viewingStudent.payments && viewingStudent.payments.length > 0 ? (
                  <div className="overflow-x-auto border rounded">
                    <table className="min-w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Amount</th>
                          <th className="px-4 py-2 text-left">Mode</th>
                          <th className="px-4 py-2 text-left">Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {viewingStudent.payments.map((payment: any, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-2">{formatDate(payment.date)}</td>
                            <td className="px-4 py-2">₹{payment.amount.toLocaleString()}</td>
                            <td className="px-4 py-2">{payment.mode}</td>
                            <td className="px-4 py-2">{payment.note || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No payment records found.</p>
                )}
              </div>
              
              <div className="col-span-1 md:col-span-2 flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCloseDialog}>Close</Button>
                <Button onClick={() => navigate(`/edit-student/${viewingStudent.id}`)}>Edit Details</Button>
                {hasDeletePermission() && (
                  <Button 
                    variant="outline" 
                    className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to permanently delete ${viewingStudent.name}? This action cannot be undone.`)) {
                        handleDeleteStudent(viewingStudent.id);
                        handleCloseDialog();
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Student
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudentsPage;
