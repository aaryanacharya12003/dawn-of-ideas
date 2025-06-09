
import { PG, Room, Student } from '@/types';

// Filter data based on user role with unified admin access
export const filterDataByUserRole = (allPGs: PG[], allRooms: Room[], allStudents: Student[], currentUser: any) => {
  if (!currentUser) {
    console.log('No user found, returning empty data');
    return { filteredPGs: [], filteredRooms: [], filteredStudents: [] };
  }

  console.log("Filtering data for user role:", currentUser.role, "User ID:", currentUser.id);

  // Admin gets ALL data - no filtering
  if (currentUser.role === 'admin') {
    console.log('Admin user - returning ALL data without filtering');
    console.log('Admin data access - PGs:', allPGs.length, 'Rooms:', allRooms.length, 'Students:', allStudents.length);
    return {
      filteredPGs: allPGs,
      filteredRooms: allRooms,
      filteredStudents: allStudents
    };
  }

  // Accountant can see all data for financial oversight
  if (currentUser.role === 'accountant') {
    console.log('Accountant user - returning all data for financial oversight');
    return {
      filteredPGs: allPGs,
      filteredRooms: allRooms,
      filteredStudents: allStudents
    };
  }

  // Manager and Viewer can only see data for their assigned PGs
  if (currentUser.role === 'manager' || currentUser.role === 'viewer') {
    if (!currentUser.assignedPGs || !Array.isArray(currentUser.assignedPGs) || currentUser.assignedPGs.length === 0) {
      console.log(`${currentUser.role} has no assigned PGs, returning empty data`);
      return { filteredPGs: [], filteredRooms: [], filteredStudents: [] };
    }

    console.log(`${currentUser.role} assigned PGs:`, currentUser.assignedPGs);

    const managedPGs = allPGs.filter(pg => {
      const isAssigned = currentUser.assignedPGs.includes(pg.name);
      console.log(`PG ${pg.name} - Assigned to ${currentUser.role}: ${isAssigned}`);
      return isAssigned;
    });

    const managedRooms = allRooms.filter(room => {
      const pg = allPGs.find(p => p.id === room.pgId);
      const isAssigned = pg && currentUser.assignedPGs.includes(pg.name);
      console.log(`Room ${room.number} in PG ${pg?.name} - Assigned to ${currentUser.role}: ${isAssigned}`);
      return isAssigned;
    });

    const managedStudents = allStudents.filter(student => {
      const pg = allPGs.find(p => p.id === student.pgId);
      const isAssigned = pg && currentUser.assignedPGs.includes(pg.name);
      console.log(`Student ${student.name} in PG ${pg?.name} - Assigned to ${currentUser.role}: ${isAssigned}`);
      return isAssigned;
    });

    console.log(`${currentUser.role} filtered data: ${managedPGs.length} PGs, ${managedRooms.length} rooms, ${managedStudents.length} students`);
    
    return {
      filteredPGs: managedPGs,
      filteredRooms: managedRooms,
      filteredStudents: managedStudents
    };
  }

  // Unknown role gets no data
  console.log('Unknown user role, returning empty data');
  return { filteredPGs: [], filteredRooms: [], filteredStudents: [] };
};
