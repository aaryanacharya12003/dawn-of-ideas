export type PaymentMode = 'Cash' | 'UPI' | 'Bank Transfer';
export type RoomStatus = 'vacant' | 'partial' | 'full' | 'maintenance';
export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid';
export type PGType = 'male' | 'female' | 'unisex';

// More explicit JSON value types to prevent deep recursion
export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export type UserRole = 'admin' | 'manager' | 'accountant' | 'viewer';

export type PaymentApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: string;
  lastLogin?: string;
  assignedPGs?: string[];
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  address: string;
  aadhaarNumber: string;
  aadhaarFile?: string;
  occupation: string;
  totalFees: number;
  deposit: number;
  startDate: Date;
  endDate: Date;
  payments: Payment[];
  roomId: string;
  pgId?: string; // PG ID is optional but properly typed
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: Date;
  mode: PaymentMode;
  note?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  addedBy?: string; // Track who added the payment
  addedByName?: string; // Name of the person who added it
}

export interface Room {
  id: string;
  number: string;
  capacity: number;
  students: Student[];
  pgId?: string;
  floor?: number;
  type?: string;
  amenities?: string[];
  status?: RoomStatus;
  rent?: number;
  pgName?: string; // Add PG name for display
  pgAddress?: string; // Add PG address for display
}

export interface RoomType {
  id: string;
  name: string;
  capacity: number;
  amenities: string[];
  price: number;
}

// PG type definition
export interface PG {
  id: string;
  name: string;
  location: string;
  contactInfo: string;
  type: 'male' | 'female' | 'unisex';
  totalRooms: number;
  totalBeds: number;
  floors: number;
  images: string[];
  amenities: string[];
  manager?: string;
  managerId?: string;
  roomTypes: RoomType[];
  revenue: number;
  occupancyRate: number;
  monthlyRent: number;
  // Additional calculated fields for proper occupancy tracking
  actualOccupancy?: number;
  totalCapacity?: number;
}

export interface DashboardStats {
  totalStudents: number;
  studentsGrowth: number;
  roomsOccupied: number;
  totalRooms: number;
  occupancyRate: number;
  pendingPayments: number;
  studentsWithDues: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  // Add missing properties for payment management
  totalRevenue?: number;
  pendingAmount?: number;
  totalPayments?: number;
  verifiedPayments?: number;
  pendingVerification?: number;
  payments?: Payment[];
}

// Safe JSON conversion functions
export function safeJsonStringify(value: any): string {
  try {
    return JSON.stringify(value);
  } catch (e) {
    console.error('Error stringifying JSON:', e);
    return '[]';
  }
}

export function safeJsonParse(value: string): any {
  try {
    return JSON.parse(value);
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return null;
  }
}

// Simple conversion to avoid deep recursion
export function toJson(value: any): JsonValue {
  if (value === null || value === undefined) {
    return null;
  }
  
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  
  try {
    // Use JSON.stringify/parse to strip any complex objects/functions
    return JSON.parse(JSON.stringify(value));
  } catch (e) {
    console.error('Error converting to JSON:', e);
    return null;
  }
}

export function ensureStringArray(value: any): string[] {
  if (!value) return [];
  
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch (e) {
      // Not JSON, return empty array
    }
  }
  
  if (Array.isArray(value)) {
    return value.map(String);
  }
  
  return [];
}

export function ensureRoomTypeArray(value: any): RoomType[] {
  if (!value) return [];
  
  let arrayToProcess = value;
  if (typeof value === 'string') {
    try {
      arrayToProcess = JSON.parse(value);
    } catch (e) {
      return [];
    }
  }
  
  if (!Array.isArray(arrayToProcess)) {
    return [];
  }
  
  return arrayToProcess.map(item => ({
    id: String(item?.id || ''),
    name: String(item?.name || ''),
    capacity: Number(item?.capacity || 0),
    amenities: ensureStringArray(item?.amenities || []),
    price: Number(item?.price || 0)
  }));
}

export function ensurePGType(value: string): PGType {
  if (value === 'male' || value === 'female' || value === 'unisex') {
    return value;
  }
  return 'unisex'; // Default fallback
}
