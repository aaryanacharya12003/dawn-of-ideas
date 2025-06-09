import { supabase } from '@/integrations/supabase/client';
import { Student, Payment, PaymentApprovalStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Define student interface that matches Supabase table structure
interface DBStudent {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  aadhaar_number: string | null;
  occupation: string | null;
  total_fees: number;
  deposit: number;
  start_date: string;
  end_date: string;
  room_id: string | null;
  created_at: string;
  pg_id: string | null;
}

// Define payment interface that matches Supabase table structure
interface DBPayment {
  id: string;
  student_id: string;
  date: string;
  amount: number;
  mode: string;
  note: string | null;
  approval_status: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at?: string;
}

/**
 * Transforms a database student object to our application's Student model
 */
const transformStudentFromDB = async (student: DBStudent): Promise<Student> => {
  // Fetch payments for this student
  const { data: paymentsData, error: paymentsError } = await (supabase as any)
    .from('payments')
    .select('*')
    .eq('student_id', student.id);
    
  if (paymentsError) {
    console.error("Error fetching payments:", paymentsError);
  }
  
  // Transform payments data
  const payments: Payment[] = (paymentsData || []).map((payment: DBPayment) => ({
    id: payment.id,
    studentId: payment.student_id,
    date: new Date(payment.date),
    amount: payment.amount,
    mode: payment.mode as any,
    note: payment.note || '',
    approvalStatus: payment.approval_status as PaymentApprovalStatus,
    approvedBy: payment.approved_by || undefined,
    approvedAt: payment.approved_at ? new Date(payment.approved_at) : undefined
  }));
  
  // Return transformed student with payments
  return {
    id: student.id,
    name: student.name,
    phone: student.phone || '',
    address: student.address || '',
    aadhaarNumber: student.aadhaar_number || '',
    occupation: student.occupation || '',
    totalFees: student.total_fees,
    deposit: student.deposit,
    startDate: new Date(student.start_date),
    endDate: new Date(student.end_date),
    roomId: student.room_id || '',
    pgId: student.pg_id || undefined,
    payments
  };
};

/**
 * Transforms our application's Student model to a database student object
 */
const transformStudentToDB = (student: Omit<Student, 'id' | 'payments'>): Omit<DBStudent, 'id' | 'created_at'> => {
  return {
    name: student.name,
    phone: student.phone || null,
    address: student.address || null,
    aadhaar_number: student.aadhaarNumber || null,
    occupation: student.occupation || null,
    total_fees: student.totalFees,
    deposit: student.deposit,
    start_date: student.startDate.toISOString().split('T')[0],
    end_date: student.endDate.toISOString().split('T')[0],
    room_id: student.roomId || null,
    pg_id: student.pgId || null
  };
};

// ENHANCED: Helper function to check if a student ID is from demo data
const isDemoStudent = (studentId: string): boolean => {
  // Demo students have IDs like 'student-1', 'student-2', etc.
  // Real students have UUID format
  return studentId.startsWith('student-') && /^student-\d+$/.test(studentId);
};

// Function to search students by name or phone
export const searchStudents = async (query: string): Promise<Student[]> => {
  try {
    console.log("Searching students with query:", query);
    
    const { data, error } = await (supabase as any)
      .from('students')
      .select('*')
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%`);
      
    if (error) {
      console.error("Error searching students:", error);
      return [];
    }
    
    // Transform and return student data
    return (data || []).map((student: DBStudent) => ({
      id: student.id,
      name: student.name,
      phone: student.phone || '',
      address: student.address || '',
      aadhaarNumber: student.aadhaar_number || '',
      occupation: student.occupation || '',
      totalFees: student.total_fees,
      deposit: student.deposit,
      startDate: new Date(student.start_date),
      endDate: new Date(student.end_date),
      roomId: student.room_id || '',
      pgId: student.pg_id || undefined,
      payments: [] // Empty payments since we don't need them for search results
    }));
  } catch (error) {
    console.error("Error in searchStudents:", error);
    return [];
  }
};

// Function to fetch all students
export const fetchStudents = async (): Promise<Student[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from('students')
      .select('*');
      
    if (error) {
      console.error("Error fetching students:", error);
      return [];
    }
    
    // Map through each student and transform it
    const students: Student[] = [];
    for (const studentData of data || []) {
      const student = await transformStudentFromDB(studentData);
      students.push(student);
    }
    
    return students;
  } catch (error) {
    console.error("Error in fetchStudents:", error);
    return [];
  }
};

// Function to fetch a student by ID
export const fetchStudentById = async (studentId: string): Promise<Student | null> => {
  try {
    const { data, error } = await (supabase as any)
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();
      
    if (error || !data) {
      console.error("Error fetching student by ID:", error);
      return null;
    }
    
    return await transformStudentFromDB(data as DBStudent);
  } catch (error) {
    console.error("Error in fetchStudentById:", error);
    return null;
  }
};

// Function to fetch students by room ID
export const getStudentsByRoomId = async (roomId: string): Promise<Student[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from('students')
      .select('*')
      .eq('room_id', roomId);
      
    if (error) {
      console.error("Error fetching students by room ID:", error);
      return [];
    }
    
    // Map through each student and transform it
    const students: Student[] = [];
    for (const studentData of data || []) {
      const student = await transformStudentFromDB(studentData);
      students.push(student);
    }
    
    return students;
  } catch (error) {
    console.error("Error in getStudentsByRoomId:", error);
    return [];
  }
};

// Function to add a new student
export const addStudent = async (student: Omit<Student, 'id' | 'payments'>): Promise<Student | null> => {
  try {
    const studentId = uuidv4();
    
    // Transform student data for database
    const dbStudent = transformStudentToDB(student);
    
    console.log("Adding student to Supabase with data:", { id: studentId, ...dbStudent });
    
    // Insert the new student
    const { error } = await (supabase as any)
      .from('students')
      .insert({
        id: studentId,
        ...dbStudent
      });
      
    if (error) {
      console.error("Error adding student to Supabase:", error);
      return null;
    }
    
    console.log("Student added successfully to Supabase with ID:", studentId);
    
    // Fetch the newly created student
    const { data, error: fetchError } = await (supabase as any)
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();
      
    if (fetchError || !data) {
      console.error("Error fetching created student:", fetchError);
      return null;
    }
    
    // Return the new student
    return await transformStudentFromDB(data as DBStudent);
  } catch (error) {
    console.error("Error in addStudent:", error);
    return null;
  }
};

// Function to remove a student from a room
export const removeStudent = async (studentId: string, roomId: string): Promise<boolean> => {
  try {
    // Delete the student from the database
    const { error } = await (supabase as any)
      .from('students')
      .delete()
      .eq('id', studentId)
      .eq('room_id', roomId);
      
    if (error) {
      console.error("Error removing student:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in removeStudent:", error);
    return false;
  }
};

// NEW: Function to clear all student data (both demo and real)
export const clearAllStudentData = async (): Promise<boolean> => {
  try {
    console.log("Clearing all student data...");
    
    // Clear demo students from localStorage
    localStorage.removeItem('demo-students');
    console.log("Demo students cleared from localStorage");
    
    // Clear all real students from database
    // First, delete all payments
    const { error: paymentsError } = await (supabase as any)
      .from('payments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all payments
      
    if (paymentsError) {
      console.error("Error deleting all payments:", paymentsError);
      return false;
    }
    
    // Then delete all students
    const { error: studentsError } = await (supabase as any)
      .from('students')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all students
      
    if (studentsError) {
      console.error("Error deleting all students:", studentsError);
      return false;
    }
    
    console.log("All student data cleared successfully");
    return true;
  } catch (error) {
    console.error("Error in clearAllStudentData:", error);
    return false;
  }
};

// ENHANCED: Function to delete a student completely (handles both demo and real users)
export const deleteStudent = async (studentId: string): Promise<boolean> => {
  try {
    console.log("Deleting student completely:", studentId);
    
    // Check if this is a demo student
    if (isDemoStudent(studentId)) {
      console.log("Demo student detected, deleting from localStorage");
      
      // For demo students, remove from localStorage
      const demoStudents = JSON.parse(localStorage.getItem('demo-students') || '[]');
      const updatedStudents = demoStudents.filter((s: any) => s.id !== studentId);
      localStorage.setItem('demo-students', JSON.stringify(updatedStudents));
      
      console.log("Demo student deleted successfully from localStorage");
      return true;
    }
    
    // For real students in database
    console.log("Real student detected, deleting from database");
    
    // First, delete all payments associated with this student
    const { error: paymentsError } = await (supabase as any)
      .from('payments')
      .delete()
      .eq('student_id', studentId);
      
    if (paymentsError) {
      console.error("Error deleting student payments:", paymentsError);
      return false;
    }
    
    // Then delete the student from the database
    const { error: studentError } = await (supabase as any)
      .from('students')
      .delete()
      .eq('id', studentId);
      
    if (studentError) {
      console.error("Error deleting student:", studentError);
      return false;
    }
    
    console.log("Student and associated payments deleted successfully");
    return true;
  } catch (error) {
    console.error("Error in deleteStudent:", error);
    return false;
  }
};

// Function to add a payment - ENHANCED VERSION with approval status
export const addPayment = async (payment: Omit<Payment, 'id'>): Promise<Payment | null> => {
  try {
    const paymentId = uuidv4();
    
    console.log("Adding payment to database:", {
      id: paymentId,
      student_id: payment.studentId,
      date: payment.date.toISOString().split('T')[0],
      amount: payment.amount,
      mode: payment.mode,
      note: payment.note,
      approval_status: 'pending'
    });
    
    // Insert the new payment with pending approval status
    const { data, error } = await (supabase as any)
      .from('payments')
      .insert({
        id: paymentId,
        student_id: payment.studentId,
        date: payment.date.toISOString().split('T')[0],
        amount: payment.amount,
        mode: payment.mode,
        note: payment.note || '',
        approval_status: 'pending'
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error adding payment to database:", error);
      return null;
    }
    
    console.log("Payment added successfully to database:", data);
    
    // Return the new payment
    return {
      id: paymentId,
      ...payment,
      approvalStatus: 'pending'
    };
  } catch (error) {
    console.error("Error in addPayment:", error);
    return null;
  }
};

// Enhanced function to approve/reject payments
export const updatePaymentApproval = async (
  paymentId: string, 
  status: PaymentApprovalStatus, 
  approvedBy: string
): Promise<boolean> => {
  try {
    const { error } = await (supabase as any)
      .from('payments')
      .update({
        approval_status: status,
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      })
      .eq('id', paymentId);
      
    if (error) {
      console.error("Error updating payment approval:", error);
      return false;
    }
    
    console.log(`Payment ${paymentId} ${status} successfully`);
    return true;
  } catch (error) {
    console.error("Error in updatePaymentApproval:", error);
    return false;
  }
};

// NEW: Function to approve all pending payments
export const approveAllPendingPayments = async (approvedBy: string): Promise<boolean> => {
  try {
    const { error } = await (supabase as any)
      .from('payments')
      .update({
        approval_status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      })
      .eq('approval_status', 'pending');
      
    if (error) {
      console.error("Error approving all payments:", error);
      return false;
    }
    
    console.log("All pending payments approved successfully");
    return true;
  } catch (error) {
    console.error("Error in approveAllPendingPayments:", error);
    return false;
  }
};

// Enhanced function to get pending payments for accountants
export const getPendingPayments = async (): Promise<Payment[]> => {
  try {
    const { data, error } = await (supabase as any)
      .from('payments')
      .select(`
        *,
        students:student_id (
          name,
          room_id,
          pg_id
        )
      `)
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching pending payments:", error);
      return [];
    }
    
    return (data || []).map((payment: any) => ({
      id: payment.id,
      studentId: payment.student_id,
      date: new Date(payment.date),
      amount: payment.amount,
      mode: payment.mode,
      note: payment.note || '',
      approvalStatus: payment.approval_status,
      approvedBy: payment.approved_by,
      approvedAt: payment.approved_at ? new Date(payment.approved_at) : undefined,
      studentName: payment.students?.name || 'Unknown',
      pgId: payment.students?.pg_id
    }));
  } catch (error) {
    console.error("Error in getPendingPayments:", error);
    return [];
  }
};

// NEW: Function to get all payments (for admins/managers to see all PG data)
export const getAllPayments = async (userRole?: string): Promise<Payment[]> => {
  try {
    let query = (supabase as any)
      .from('payments')
      .select(`
        *,
        students:student_id (
          name,
          room_id,
          pg_id,
          rooms:room_id (
            room_number,
            pgs:pg_id (
              name
            )
          )
        )
      `)
      .order('created_at', { ascending: false });

    const { data, error } = await query;
      
    if (error) {
      console.error("Error fetching all payments:", error);
      return [];
    }
    
    return (data || []).map((payment: any) => ({
      id: payment.id,
      studentId: payment.student_id,
      date: new Date(payment.date),
      amount: payment.amount,
      mode: payment.mode,
      note: payment.note || '',
      approvalStatus: payment.approval_status,
      approvedBy: payment.approved_by,
      approvedAt: payment.approved_at ? new Date(payment.approved_at) : undefined,
      studentName: payment.students?.name || 'Unknown',
      pgId: payment.students?.pg_id,
      pgName: payment.students?.rooms?.pgs?.name || 'Unknown PG',
      roomNumber: payment.students?.rooms?.room_number || 'Unknown Room'
    }));
  } catch (error) {
    console.error("Error in getAllPayments:", error);
    return [];
  }
};

// NEW: Function to get payment statistics for all PGs
export const getPaymentStatistics = async (): Promise<{
  totalRevenue: number;
  pendingAmount: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  monthlyRevenue: number;
}> => {
  try {
    // Get all payments
    const { data: allPayments, error: allError } = await (supabase as any)
      .from('payments')
      .select('amount, approval_status, date');
      
    if (allError) {
      console.error("Error fetching payment statistics:", allError);
      return {
        totalRevenue: 0,
        pendingAmount: 0,
        approvedCount: 0,
        pendingCount: 0,
        rejectedCount: 0,
        monthlyRevenue: 0
      };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const stats = (allPayments || []).reduce((acc, payment) => {
      const paymentDate = new Date(payment.date);
      const isCurrentMonth = paymentDate.getMonth() === currentMonth && 
                            paymentDate.getFullYear() === currentYear;
      
      if (payment.approval_status === 'approved') {
        acc.totalRevenue += payment.amount;
        acc.approvedCount++;
        if (isCurrentMonth) {
          acc.monthlyRevenue += payment.amount;
        }
      } else if (payment.approval_status === 'pending') {
        acc.pendingAmount += payment.amount;
        acc.pendingCount++;
      } else if (payment.approval_status === 'rejected') {
        acc.rejectedCount++;
      }
      
      return acc;
    }, {
      totalRevenue: 0,
      pendingAmount: 0,
      approvedCount: 0,
      pendingCount: 0,
      rejectedCount: 0,
      monthlyRevenue: 0
    });

    return stats;
  } catch (error) {
    console.error("Error in getPaymentStatistics:", error);
    return {
      totalRevenue: 0,
      pendingAmount: 0,
      approvedCount: 0,
      pendingCount: 0,
      rejectedCount: 0,
      monthlyRevenue: 0
    };
  }
};

// Function to update PG revenue based on payments
const updatePGRevenue = async (studentId: string): Promise<void> => {
  try {
    // Get the student to find their PG ID
    const { data: studentData, error: studentError } = await (supabase as any)
      .from('students')
      .select('pg_id')
      .eq('id', studentId)
      .single();
      
    if (studentError || !studentData?.pg_id) {
      console.error("Error fetching student PG ID:", studentError);
      return;
    }
    
    const pgId = studentData.pg_id;
    
    // Calculate total revenue for this PG from all payments
    const { data: studentsInPG, error: studentsError } = await (supabase as any)
      .from('students')
      .select('id')
      .eq('pg_id', pgId);
      
    if (studentsError) {
      console.error("Error fetching students in PG:", studentsError);
      return;
    }
    
    if (!studentsInPG || studentsInPG.length === 0) {
      return;
    }
    
    const studentIds = studentsInPG.map(s => s.id);
    
    // Get all payments for students in this PG
    const { data: paymentsData, error: paymentsError } = await (supabase as any)
      .from('payments')
      .select('amount')
      .in('student_id', studentIds);
      
    if (paymentsError) {
      console.error("Error fetching payments for PG:", paymentsError);
      return;
    }
    
    // Calculate total revenue
    const totalRevenue = (paymentsData || []).reduce((sum, payment) => sum + payment.amount, 0);
    
    console.log(`Updating PG ${pgId} revenue to:`, totalRevenue);
    
    // Update PG revenue
    const { error: updateError } = await (supabase as any)
      .from('pgs')
      .update({ revenue: totalRevenue })
      .eq('id', pgId);
      
    if (updateError) {
      console.error("Error updating PG revenue:", updateError);
    } else {
      console.log("PG revenue updated successfully");
    }
  } catch (error) {
    console.error("Error in updatePGRevenue:", error);
  }
};
