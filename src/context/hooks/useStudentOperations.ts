
import { Student } from '@/types';
import { addStudent as addStudentService, removeStudent, deleteStudent, addPayment as addPaymentService, fetchStudentById } from '@/services/studentService';

export const useStudentOperations = (user: any, students: Student[], refreshAllData: () => Promise<void>, loadAllData: () => Promise<void>) => {
  const handleAddStudent = async (student: Omit<Student, 'id'>) => {
    console.log("DataContext: Adding student:", student.name);
    
    try {
      if (user?.id?.startsWith('demo-')) {
        console.log("Demo user detected, saving to localStorage");
        
        const demoId = `student-${Date.now()}`;
        const newStudent: Student = {
          ...student,
          id: demoId,
          payments: student.payments || []
        };
        
        const existingStudents = JSON.parse(localStorage.getItem('demo-students') || '[]');
        const updatedStudents = [...existingStudents, newStudent];
        localStorage.setItem('demo-students', JSON.stringify(updatedStudents));
        
        await refreshAllData();
        console.log("Demo student added successfully:", newStudent);
        return;
      }
      
      const { payments, ...studentWithoutPayments } = student;
      const addedStudent = await addStudentService(studentWithoutPayments);
      
      if (addedStudent) {
        console.log("Real student added successfully, refreshing data...");
        await loadAllData();
      } else {
        throw new Error("Failed to add student to database");
      }
    } catch (error) {
      console.error("Error in handleAddStudent:", error);
      throw error;
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    console.log("DataContext: Removing student:", studentId);
    const student = students.find(s => s.id === studentId);
    if (student && student.roomId) {
      await removeStudent(studentId, student.roomId);
      await refreshAllData();
    } else {
      console.error("Could not find student or roomId for removal");
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    console.log("DataContext: Deleting student:", studentId);
    
    if (user?.id?.startsWith('demo-')) {
      console.log("Demo user detected, handling demo student deletion");
      
      const success = await deleteStudent(studentId);
      if (success) {
        await refreshAllData();
        console.log("Demo student deleted and data refreshed");
      }
      return;
    }
    
    await deleteStudent(studentId);
    await refreshAllData();
  };

  const handleClearAllStudents = async () => {
    console.log("DataContext: Clearing all students");
    
    const { clearAllStudentData } = await import('@/services/studentService');
    const success = await clearAllStudentData();
    
    if (success) {
      await refreshAllData();
      console.log("All students cleared and data refreshed");
    }
  };

  const handleAddPayment = async (studentId: string, paymentData: any) => {
    console.log("DataContext: Adding payment for student:", studentId, paymentData);
    
    try {
      if (user?.id?.startsWith('demo-')) {
        console.log("Demo user detected, saving payment to localStorage");
        
        const existingStudents = JSON.parse(localStorage.getItem('demo-students') || '[]');
        
        const updatedStudents = existingStudents.map((student: Student) => {
          if (student.id === studentId) {
            const newPayment = {
              id: `payment-${Date.now()}`,
              ...paymentData,
              studentId: studentId,
              approvalStatus: 'pending',
              addedBy: user.id,
              addedByName: user.name || 'Demo User'
            };
            
            return {
              ...student,
              payments: [...(student.payments || []), newPayment]
            };
          }
          return student;
        });
        
        localStorage.setItem('demo-students', JSON.stringify(updatedStudents));
        await refreshAllData();
        console.log("Demo payment added successfully");
        return;
      }
      
      const payment = {
        ...paymentData,
        studentId: studentId,
        approvalStatus: 'pending',
        addedBy: user?.id,
        addedByName: user?.name || 'Unknown'
      };
      await addPaymentService(payment);
      await refreshAllData();
    } catch (error) {
      console.error("Error in handleAddPayment:", error);
      throw error;
    }
  };

  const handleGetStudentById = async (studentId: string): Promise<Student | null> => {
    console.log("DataContext: Getting student by ID:", studentId);
    return await fetchStudentById(studentId);
  };

  return {
    addStudent: handleAddStudent,
    removeStudent: handleRemoveStudent,
    deleteStudent: handleDeleteStudent,
    clearAllStudents: handleClearAllStudents,
    addPayment: handleAddPayment,
    getStudentById: handleGetStudentById
  };
};
