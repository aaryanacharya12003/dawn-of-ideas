
import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Student } from '@/types';
import AddStudentForm from '@/components/AddStudentForm';
import { useToast } from '@/hooks/use-toast';
import { fetchRooms } from '@/services/roomService';
import { fetchStudentById } from '@/services/studentService'; 
import { Room } from '@/types';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface EnhancedRoom extends Room {
  pgName?: string;
  pgLocation?: string;
}

const AddStudentPage = () => {
  const { addStudent, pgs, rooms: contextRooms } = useData();
  const { user } = useAuth();
  const { id: studentId } = useParams<{ id?: string }>();
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [rooms, setRooms] = useState<EnhancedRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        let fetchedRooms: any[] = [];
        
        // For demo users, use rooms from DataContext
        if (user?.id?.startsWith('demo-')) {
          console.log('Loading demo rooms from context:', contextRooms);
          fetchedRooms = contextRooms;
        } else {
          // For real users, fetch from database
          fetchedRooms = await fetchRooms();
          console.log('Fetched rooms from database:', fetchedRooms);
        }
        
        // Enhance rooms with PG information
        const enhancedRooms = fetchedRooms.map(room => {
          const pg = pgs.find(p => p.id === (room.pgId || room.pg_id));
          return {
            ...room,
            id: room.id,
            number: room.number || room.room_number,
            capacity: room.capacity,
            students: room.students || [],
            pgId: room.pgId || room.pg_id,
            type: room.type || room.room_type,
            status: room.status,
            pgName: pg?.name || 'Unknown PG',
            pgLocation: pg?.location || 'Unknown Location'
          };
        });
        
        setRooms(enhancedRooms);
        console.log("Enhanced rooms for student selection:", enhancedRooms);
        
        // If we have a studentId, we're in edit mode
        if (studentId) {
          setIsEditMode(true);
          
          let fetchedStudent: Student | null = null;
          
          if (user?.id?.startsWith('demo-')) {
            // For demo users, get from localStorage
            const demoStudents = JSON.parse(localStorage.getItem('demo-students') || '[]');
            fetchedStudent = demoStudents.find((s: Student) => s.id === studentId) || null;
          } else {
            // For real users, fetch from database
            fetchedStudent = await fetchStudentById(studentId);
          }
          
          if (fetchedStudent) {
            setStudent(fetchedStudent);
            setSelectedRoomId(fetchedStudent.roomId);
          } else {
            toast({
              title: "Error",
              description: "Could not find the requested student.",
              variant: "destructive"
            });
            navigate('/students');
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [studentId, navigate, toast, pgs, contextRooms, user]);

  const availableRooms = rooms.filter(room => {
    // For rooms without students array or with fewer students than capacity
    const currentOccupancy = room.students ? room.students.length : 0;
    
    // If in edit mode and this is the student's current room, include it
    if (isEditMode && student && room.id === student.roomId) {
      return true;
    }
    
    // Include rooms that have space available
    return currentOccupancy < room.capacity;
  });

  console.log("Available rooms for selection:", availableRooms);
  console.log("Total rooms:", rooms.length);

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRoomId(e.target.value);
    console.log("Selected room ID:", e.target.value);
  };

  const handleAddStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      setSaving(true);
      console.log("Adding student with data:", studentData);
      
      // Ensure the student has the selected room ID and PG ID
      const studentWithRoom = {
        ...studentData,
        roomId: selectedRoomId,
        pgId: studentData.pgId || rooms.find(r => r.id === selectedRoomId)?.pgId,
        payments: studentData.payments || [] // Ensure payments array exists
      };
      
      console.log("Student data with room:", studentWithRoom);
      
      // Call addStudent from DataContext which handles both demo and real modes
      await addStudent(studentWithRoom);
      
      // Show success toast
      toast({
        title: "Student added",
        description: `${studentData.name} has been successfully added to the system`,
      });
      
      // Navigate away after success
      navigate('/students');
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding the student.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Student' : 'Add New Student'}</h1>
        <Button variant="outline" onClick={() => navigate('/students')}>Back to Students</Button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Select Room</h2>
          {availableRooms.length > 0 ? (
            <div>
              <select 
                className="w-full rounded-md border border-input p-3 text-sm"
                value={selectedRoomId}
                onChange={handleRoomChange}
                disabled={saving}
              >
                <option value="">Select a room</option>
                {availableRooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.pgName} - Room {room.number} ({room.type || 'Standard'}) - {room.pgLocation}
                    {` (${room.students?.length || 0}/${room.capacity} occupied)`}
                  </option>
                ))}
              </select>
              
              {selectedRoomId && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                  {(() => {
                    const selectedRoom = rooms.find(r => r.id === selectedRoomId);
                    return selectedRoom ? (
                      <div className="text-sm text-blue-800">
                        <p><span className="font-medium">PG:</span> {selectedRoom.pgName}</p>
                        <p><span className="font-medium">Location:</span> {selectedRoom.pgLocation}</p>
                        <p><span className="font-medium">Room:</span> {selectedRoom.number} ({selectedRoom.type || 'Standard'})</p>
                        <p><span className="font-medium">Capacity:</span> {selectedRoom.capacity} students</p>
                        <p><span className="font-medium">Current Occupancy:</span> {selectedRoom.students?.length || 0}/{selectedRoom.capacity}</p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
              <p className="font-medium">No rooms available</p>
              <p className="text-sm mt-1">
                {rooms.length === 0 
                  ? "No rooms found. Please create some rooms first."
                  : "All rooms are at full capacity."
                }
              </p>
              {rooms.length === 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => navigate('/room-management')}
                >
                  Go to Room Management
                </Button>
              )}
            </div>
          )}
        </div>
        
        {selectedRoomId && (
          <AddStudentForm 
            roomId={selectedRoomId}
            onAddStudent={handleAddStudent}
            selectedRoom={rooms.find(room => room.id === selectedRoomId)}
            disabled={saving}
            student={isEditMode ? student : undefined}
          />
        )}
      </div>
    </>
  );
};

export default AddStudentPage;
