
import { useState, useCallback, useMemo } from 'react';
import { PG, Room, Student, User } from '@/types';
import { fetchPGs } from '@/services/pg';
import { fetchRooms } from '@/services/roomService';
import { fetchStudents } from '@/services/studentService';
import { fetchUsers } from '@/services/userService';
import { transformRoomFromDB, enhanceStudentsWithRoomInfo, populateStudentsIntoRooms } from '../utils/dataTransformUtils';
import { filterDataByUserRole } from '../utils/roleFilterUtils';

export const useDataLoader = (user: any) => {
  const [pgs, setPgs] = useState<PG[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize stable references for the setter functions
  const stableSetters = useMemo(() => ({
    setPgs,
    setRooms,
    setStudents,
    setUsers
  }), []);

  // Function to load all data
  const loadAllData = useCallback(async () => {
    if (!user || !user.id) {
      console.log("DataLoader: No user or user ID, skipping data load");
      return;
    }

    try {
      setIsLoading(true);
      console.log("DataLoader: Loading all data for user:", user?.email, user?.role);
      
      // Load PGs first
      console.log("DataLoader: Loading PGs...");
      const pgsData = await fetchPGs();
      console.log("DataLoader: Loaded PGs:", pgsData.length, pgsData.map(pg => ({ id: pg.id, name: pg.name })));
      
      // Load rooms with PG information
      console.log("DataLoader: Loading rooms...");
      const roomsData = await fetchRooms();
      console.log("DataLoader: Raw rooms data from DB:", roomsData.length);
      
      // Transform rooms and include PG information
      const transformedRooms = roomsData.map(transformRoomFromDB);
      console.log("DataLoader: Transformed rooms:", transformedRooms.length);
      
      // Load students
      console.log("DataLoader: Loading students...");
      let studentsData = [];
      
      // Check if this is a demo user
      if (user?.id?.startsWith('demo-')) {
        // For demo users, get from localStorage
        const demoStudents = JSON.parse(localStorage.getItem('demo-students') || '[]');
        console.log("DataLoader: Loaded demo students from localStorage:", demoStudents.length);
        studentsData = demoStudents;
      } else {
        // For real users, fetch from database
        studentsData = await fetchStudents();
        console.log("DataLoader: Loaded students from database:", studentsData.length);
      }
      
      // Log payment data for each student
      studentsData.forEach(student => {
        console.log(`DataLoader: Student ${student.name} has ${student.payments?.length || 0} payments`, student.payments || []);
      });
      
      // Enhance students with room and PG information
      const enhancedStudents = enhanceStudentsWithRoomInfo(studentsData, transformedRooms, pgsData);
      console.log("DataLoader: Enhanced students with room info:", enhancedStudents.length);
      
      // Populate students into their assigned rooms
      const roomsWithStudents = populateStudentsIntoRooms(transformedRooms, enhancedStudents);
      console.log("DataLoader: Populated students into rooms:", roomsWithStudents.length);
      
      // Apply role-based filtering
      const { filteredPGs, filteredRooms, filteredStudents } = filterDataByUserRole(
        pgsData, 
        roomsWithStudents, 
        enhancedStudents, 
        user
      );
      
      console.log("DataLoader: After role filtering - PGs:", filteredPGs.length, "Rooms:", filteredRooms.length, "Students:", filteredStudents.length);
      
      // Set the filtered data
      stableSetters.setPgs(filteredPGs);
      stableSetters.setRooms(filteredRooms);
      stableSetters.setStudents(filteredStudents);
      
      // Load users (only if admin)
      if (user?.role === 'admin') {
        console.log("DataLoader: Loading users...");
        const usersData = await fetchUsers();
        console.log("DataLoader: Loaded users:", usersData.length);
        stableSetters.setUsers(usersData);
      }
      
    } catch (error) {
      console.error('DataLoader: Error loading data:', error);
      // Don't throw error, just log it and continue
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.email, user?.role, stableSetters]);

  // Refresh all data function
  const refreshAllData = useCallback(async () => {
    console.log("DataLoader: Refreshing all data...");
    await loadAllData();
    console.log("DataLoader: All data refreshed successfully");
  }, [loadAllData]);

  return {
    pgs,
    rooms,
    students,
    users,
    isLoading,
    loadAllData,
    refreshAllData,
    setPgs: stableSetters.setPgs,
    setRooms: stableSetters.setRooms,
    setStudents: stableSetters.setStudents,
    setUsers: stableSetters.setUsers
  };
};
