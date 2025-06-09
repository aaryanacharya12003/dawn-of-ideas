
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Student, Room } from '@/types';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useData } from '@/context/DataContext';
import PGSelectField from './payment/PGSelectField';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, User, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface EnhancedRoom extends Room {
  pgName?: string;
  pgLocation?: string;
}

interface AddStudentFormProps {
  roomId: string;
  onAddStudent: (student: Omit<Student, 'id' | 'payments'>) => void;
  onDeleteStudent?: (studentId: string) => void;
  disabled?: boolean;
  selectedRoom?: EnhancedRoom;
  student?: Student | null;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  aadhaarNumber: z.string().optional(),
  occupation: z.string().optional(),
  totalFees: z.coerce.number().min(0, { message: "Total fees must be a non-negative number" }),
  deposit: z.coerce.number().min(0, { message: "Deposit must be a non-negative number" }),
  startDate: z.date(),
  endDate: z.date(),
  pgId: z.string().min(1, { message: "PG is required" })
});

const AddStudentForm: React.FC<AddStudentFormProps> = ({ 
  roomId, 
  onAddStudent, 
  onDeleteStudent,
  disabled = false, 
  selectedRoom,
  student 
}) => {
  const { pgs, students } = useData();
  const { user } = useAuth();
  const [existingStudent, setExistingStudent] = useState<Student | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const isEditMode = !!student;
  
  console.log("AddStudentForm - Selected Room:", selectedRoom);
  if (student) console.log("AddStudentForm - Editing Student:", student);
  
  // Check if user has permission to delete students (only admin)
  const hasDeletePermission = () => {
    if (!user) return false;
    return user.role === 'admin';
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: student?.name || '',
      phone: student?.phone || '',
      address: student?.address || '',
      aadhaarNumber: student?.aadhaarNumber || '',
      occupation: student?.occupation || '',
      totalFees: student?.totalFees || 0,
      deposit: student?.deposit || 0,
      startDate: student?.startDate ? new Date(student.startDate) : new Date(),
      endDate: student?.endDate ? new Date(student.endDate) : new Date(new Date().setMonth(new Date().getMonth() + 6)),
      pgId: student?.pgId || selectedRoom?.pgId || ''
    }
  });

  // Function to check for duplicate students
  const checkForDuplicateStudent = (phone: string, aadhaar: string, currentStudentId?: string) => {
    if (!phone && !aadhaar) return null;
    
    // Get students in the same PG
    const pgId = selectedRoom?.pgId;
    if (!pgId) return null;
    
    const studentsInSamePG = students.filter(s => s.pgId === pgId);
    
    const duplicate = studentsInSamePG.find(s => {
      // Skip current student if editing
      if (currentStudentId && s.id === currentStudentId) return false;
      
      // Check if phone or aadhaar matches
      const phoneMatch = phone && s.phone && s.phone.trim() === phone.trim();
      const aadhaarMatch = aadhaar && s.aadhaarNumber && s.aadhaarNumber.trim() === aadhaar.trim();
      
      return phoneMatch || aadhaarMatch;
    });
    
    return duplicate || null;
  };

  // Watch phone and aadhaar fields for validation
  const watchedPhone = form.watch('phone');
  const watchedAadhaar = form.watch('aadhaarNumber');

  useEffect(() => {
    const duplicate = checkForDuplicateStudent(watchedPhone || '', watchedAadhaar || '', student?.id);
    
    if (duplicate) {
      setExistingStudent(duplicate);
      const matchType = (watchedPhone && duplicate.phone === watchedPhone) ? 'phone number' : 'Aadhaar number';
      setValidationError(`A student with this ${matchType} already exists in this PG.`);
    } else {
      setExistingStudent(null);
      setValidationError('');
    }
  }, [watchedPhone, watchedAadhaar, students, selectedRoom?.pgId, student?.id]);

  // Update form values when selectedRoom or student changes
  useEffect(() => {
    if (selectedRoom?.pgId) {
      console.log("Setting pgId in form:", selectedRoom.pgId);
      form.setValue('pgId', selectedRoom.pgId);
    }
    
    if (student) {
      form.reset({
        name: student.name,
        phone: student.phone,
        address: student.address,
        aadhaarNumber: student.aadhaarNumber,
        occupation: student.occupation,
        totalFees: student.totalFees,
        deposit: student.deposit,
        startDate: new Date(student.startDate),
        endDate: new Date(student.endDate),
        pgId: student.pgId || selectedRoom?.pgId || ''
      });
    }
  }, [selectedRoom, student, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Check for duplicates one more time before submission
    if (!isEditMode) {
      const duplicate = checkForDuplicateStudent(values.phone || '', values.aadhaarNumber || '');
      if (duplicate) {
        return; // Don't submit if duplicate found
      }
    }

    // Ensure all required fields for Student type are present
    const studentData: Omit<Student, 'id' | 'payments'> = {
      name: values.name,
      phone: values.phone || '',
      address: values.address || '',
      aadhaarNumber: values.aadhaarNumber || '',
      occupation: values.occupation || '',
      totalFees: Number(values.totalFees),
      deposit: Number(values.deposit),
      startDate: values.startDate,
      endDate: values.endDate,
      roomId,
      pgId: values.pgId || selectedRoom?.pgId
    };
    
    console.log("Form submitted with student data:", studentData);
    
    onAddStudent(studentData);
  };

  const handleDeleteClick = () => {
    if (!student || !onDeleteStudent) return;
    
    if (window.confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) {
      onDeleteStudent(student.id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{isEditMode ? 'Edit Student' : 'Add New Student'}</h3>
        
        {isEditMode && hasDeletePermission() && onDeleteStudent && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteClick}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Student
          </Button>
        )}
      </div>
      
      {existingStudent && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="text-orange-800">
              <p className="font-medium mb-2">{validationError}</p>
              <div className="bg-white p-3 rounded border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Existing Student Details:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Name:</span> {existingStudent.name}</div>
                  <div><span className="font-medium">Phone:</span> {existingStudent.phone}</div>
                  <div><span className="font-medium">Aadhaar:</span> {existingStudent.aadhaarNumber}</div>
                  <div><span className="font-medium">Occupation:</span> {existingStudent.occupation}</div>
                  <div><span className="font-medium">Room ID:</span> {existingStudent.roomId}</div>
                  <div><span className="font-medium">Total Fees:</span> ₹{existingStudent.totalFees}</div>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {selectedRoom && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3">Selected Room Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-blue-800">PG Name:</span>
              <p className="text-blue-700">{selectedRoom.pgName || 'Unknown PG'}</p>
            </div>
            <div>
              <span className="font-medium text-blue-800">Location:</span>
              <p className="text-blue-700">{selectedRoom.pgLocation || 'Unknown Location'}</p>
            </div>
            <div>
              <span className="font-medium text-blue-800">Room Number:</span>
              <p className="text-blue-700">{selectedRoom.number}</p>
            </div>
            <div>
              <span className="font-medium text-blue-800">Room Type:</span>
              <p className="text-blue-700">{selectedRoom.type || 'Standard'}</p>
            </div>
            <div>
              <span className="font-medium text-blue-800">Capacity:</span>
              <p className="text-blue-700">{selectedRoom.capacity} students</p>
            </div>
            <div>
              <span className="font-medium text-blue-800">Current Occupancy:</span>
              <p className="text-blue-700">{selectedRoom.students?.length || 0}/{selectedRoom.capacity}</p>
            </div>
          </div>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Student name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occupation</FormLabel>
                  <FormControl>
                    <Input placeholder="Student occupation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="aadhaarNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aadhaar Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Aadhaar number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="totalFees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Fees</FormLabel>
                  <FormControl>
                    <Input placeholder="Total fees" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="deposit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deposit</FormLabel>
                  <FormControl>
                    <Input placeholder="Deposit amount" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <PGSelectField
              name="pgId"
              label="PG"
              pgs={pgs}
              control={form.control}
            />
          </div>
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={disabled || (!!existingStudent && !isEditMode)}
            >
              {isEditMode ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddStudentForm;
