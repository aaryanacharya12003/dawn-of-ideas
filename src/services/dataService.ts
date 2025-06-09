
// This file now serves as a re-export of all the individual service files
// to maintain backward compatibility with existing code

export * from './studentService';
export * from './pgService';
export * from './userService';
export * from './roomService';
export * from './roomTypesService';
export * from './settingsService';
export * from './pg';

// Add exports to make them available through dataService
export { 
  searchStudents, 
  fetchStudents, 
  addStudent, 
  removeStudent, 
  addPayment as addPaymentToDb, 
  getStudentsByRoomId, 
  fetchStudentById 
} from './studentService';
