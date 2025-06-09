import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Room, Student, Payment, PaymentMode } from '@/types';
import StudentTable from './StudentTable';
import AddStudentForm from './AddStudentForm';
import StatusBadge from './StatusBadge';
import PaymentPanel from './PaymentPanel';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { 
  addStudent, 
  removeStudent, 
  getStudentsByRoomId, 
  addPayment 
} from '@/services/studentService';

interface RoomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  roomStatus: string;
  onAddStudent: (student: Student) => void;
  onRemoveStudent: (studentId: string) => void;
  onAddPayment: (payment: Payment) => void;
}

const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  isOpen,
  onClose,
  room,
  roomStatus,
  onAddStudent,
  onRemoveStudent,
  onAddPayment,
}) => {
  const [selectedTab, setSelectedTab] = useState('details');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { pgs } = useData();

  // Check if the current user has access to this room's PG
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    // Check if manager has access to this room's PG
    const checkAccess = () => {
      if (!user || user.role === 'admin') {
        // Admins have access to all rooms
        return true;
      }
      
      if (user.role === 'manager') {
        const pg = pgs.find(p => p.id === room.pgId);
        
        // Check if manager is assigned to this PG
        if (pg) {
          // Check via assignedPGs array
          if (user.assignedPGs && Array.isArray(user.assignedPGs) && user.assignedPGs.includes(pg.name)) {
            return true;
          }
          
          // Check via managerId
          if (pg.managerId === user.id) {
            return true;
          }
        }
        
        return false;
      }
      
      return false;
    };
    
    setHasAccess(checkAccess());
  }, [user, room, pgs]);

  // Load students when the modal is opened
  useEffect(() => {
    if (isOpen && room && hasAccess) {
      loadStudents();
    }
  }, [isOpen, room, hasAccess]);

  const loadStudents = async () => {
    if (!room.id) return;
    
    setLoading(true);
    try {
      const loadedStudents = await getStudentsByRoomId(room.id);
      setStudents(loadedStudents);
      
      // Update selected student if needed
      if (selectedStudent) {
        const updatedStudent = loadedStudents.find(s => s.id === selectedStudent.id);
        if (updatedStudent) {
          setSelectedStudent(updatedStudent);
        } else {
          setSelectedStudent(loadedStudents[0] || null);
        }
      } else if (loadedStudents.length > 0 && selectedTab === 'payments') {
        setSelectedStudent(loadedStudents[0]);
      }
      
      setError(null);
    } catch (err: any) {
      console.error("Error loading students:", err);
      setError(`Failed to load students: ${err.message}`);
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (studentData: Omit<Student, 'id' | 'payments'>) => {
    if (students.length >= room.capacity) {
      toast({
        title: "Room is full",
        description: "Cannot add more students to this room",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const newStudent = await addStudent({
        ...studentData,
        roomId: room.id
      });
      
      if (newStudent) {
        // Update local state
        setStudents(prev => [...prev, newStudent]);
        
        // Notify parent component
        onAddStudent(newStudent);
        
        toast({
          title: "Student added",
          description: `${newStudent.name} has been added to Room ${room.number}`,
        });
      }
    } catch (err: any) {
      console.error("Error adding student:", err);
      toast({
        title: "Error",
        description: `Failed to add student: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    setLoading(true);
    try {
      const success = await removeStudent(studentId, room.id);
      
      if (success) {
        // Update local state
        setStudents(prev => prev.filter(s => s.id !== studentId));
        
        // Update selected student if needed
        if (selectedStudent?.id === studentId) {
          const remainingStudents = students.filter(s => s.id !== studentId);
          setSelectedStudent(remainingStudents[0] || null);
          
          if (remainingStudents.length === 0) {
            setSelectedTab('details');
          }
        }
        
        // Notify parent component
        onRemoveStudent(studentId);
        
        toast({
          title: "Student removed",
          description: "Student has been removed from the room",
        });
      }
    } catch (err: any) {
      console.error("Error removing student:", err);
      toast({
        title: "Error",
        description: `Failed to remove student: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (studentId: string, paymentData: { date: Date; amount: number; mode: PaymentMode; note: string }) => {
    setLoading(true);
    try {
      const newPayment = await addPayment({
        studentId,
        ...paymentData,
      });
      
      if (newPayment) {
        // Update local state
        setStudents(prev => prev.map(student => {
          if (student.id === studentId) {
            return {
              ...student,
              payments: [...student.payments, newPayment]
            };
          }
          return student;
        }));
        
        // Update selected student if needed
        if (selectedStudent?.id === studentId) {
          setSelectedStudent({
            ...selectedStudent,
            payments: [...selectedStudent.payments, newPayment]
          });
        }
        
        // Notify parent component
        onAddPayment(newPayment);
        
        toast({
          title: "Payment added",
          description: `Payment of ₹${paymentData.amount} has been recorded`,
        });
        
        // Refresh student data to get latest payments
        loadStudents();
      }
    } catch (err: any) {
      console.error("Error adding payment:", err);
      toast({
        title: "Error",
        description: `Failed to add payment: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setSelectedTab('payments');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <DialogTitle className="text-2xl">Room {room.number}</DialogTitle>
              <DialogDescription>
                Capacity: {room.capacity} | Occupancy: {students.length}/{room.capacity}
              </DialogDescription>
            </div>
            <StatusBadge status={roomStatus as any} className="self-start md:self-auto" />
          </div>
        </DialogHeader>
        
        {!hasAccess ? (
          <div className="bg-destructive/15 p-6 rounded-md text-center">
            <p className="text-destructive font-medium">
              You don't have permission to view or manage this room.
            </p>
          </div>
        ) : error ? (
          <div className="bg-destructive/15 p-3 rounded-md">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        ) : (
          <Tabs
            value={selectedTab}
            onValueChange={(value) => {
              if (value === 'payments' && !selectedStudent && students.length > 0) {
                setSelectedStudent(students[0]);
              }
              setSelectedTab(value);
            }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="details">Room Details</TabsTrigger>
              <TabsTrigger value="payments" disabled={students.length === 0}>
                Payments
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="flex-1 overflow-y-auto">
              <div className="space-y-6">
                <StudentTable 
                  students={students} 
                  onRemoveStudent={handleRemoveStudent}
                  loading={loading}
                  onSelectStudent={handleStudentSelect}
                />
                
                <AddStudentForm 
                  roomId={room.id} 
                  onAddStudent={handleAddStudent}
                  disabled={loading || students.length >= room.capacity} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="payments" className="flex-1 overflow-y-auto">
              {selectedStudent ? (
                <PaymentPanel 
                  student={selectedStudent} 
                  onAddPayment={handleAddPayment}
                  disabled={loading}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No student selected</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RoomDetailsModal;
