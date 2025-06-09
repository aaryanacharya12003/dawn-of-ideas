
import { PG, Room, Student, RoomStatus, User, Payment } from '@/types';

export interface DataContextType {
  // PG data
  pgs: PG[];
  // Room data  
  rooms: Room[];
  // Student data
  students: Student[];
  // Users data
  users: User[];
  // Loading states
  isLoading: boolean;
  // PG operations
  addPG: (pg: Omit<PG, 'id'>) => Promise<PG>;
  updatePG: (pg: PG) => Promise<PG>;
  deletePG: (pgId: string) => Promise<void>;
  // Room operations
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  updateRoom: (room: Room) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;
  // Student operations
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  removeStudent: (studentId: string) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  clearAllStudents: () => Promise<void>;
  addPayment: (studentId: string, paymentData: any) => Promise<void>;
  getStudentById: (studentId: string) => Promise<Student | null>;
  // Utility functions
  getRoomStatus: (room: Room) => RoomStatus;
  refreshAllData: () => Promise<void>;
  // Payment approval operations
  approvePayment: (paymentId: string, status: 'approved' | 'rejected') => Promise<void>;
  getPendingPayments: () => Promise<any[]>;
}

export interface DataProviderProps {
  children: React.ReactNode;
}
