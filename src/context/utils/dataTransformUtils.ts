
import { Room, Student, PG, RoomStatus } from '@/types';

// Helper function to transform room data from database format to application format
export const transformRoomFromDB = (dbRoom: any): Room => {
  return {
    id: dbRoom.id,
    number: dbRoom.room_number,
    capacity: dbRoom.capacity,
    students: [], // Will be populated separately
    pgId: dbRoom.pg_id,
    floor: parseInt(dbRoom.room_number.toString().charAt(0)) || 1,
    type: dbRoom.room_type,
    amenities: [],
    status: dbRoom.status as RoomStatus,
    rent: dbRoom.rent,
    pgName: dbRoom.pgs?.name || 'Unknown PG',
    pgAddress: dbRoom.pgs?.address || ''
  };
};

// Helper function to enhance students with room and PG information
export const enhanceStudentsWithRoomInfo = (students: Student[], rooms: Room[], pgs: PG[]): Student[] => {
  return students.map(student => {
    const room = rooms.find(r => r.id === student.roomId);
    const pg = pgs.find(p => p.id === student.pgId);
    
    return {
      ...student,
      roomNumber: room?.number || student.roomId,
      pgName: pg?.name || 'Unknown PG'
    };
  });
};

// Helper function to populate students into their assigned rooms
export const populateStudentsIntoRooms = (rooms: Room[], students: Student[]): Room[] => {
  return rooms.map(room => {
    const roomStudents = students.filter(student => student.roomId === room.id);
    return {
      ...room,
      students: roomStudents
    };
  });
};

// Utility function to get room status
export const getRoomStatus = (room: Room): RoomStatus => {
  const currentOccupancy = room.students?.length || 0;
  const roomCapacity = room.capacity || 1;
  
  if (currentOccupancy === 0) return 'vacant';
  if (currentOccupancy >= roomCapacity) return 'full';
  return 'partial';
};
