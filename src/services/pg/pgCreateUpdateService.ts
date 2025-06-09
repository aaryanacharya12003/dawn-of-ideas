
import { supabase } from '@/integrations/supabase/client';
import { logError, transformPGFromDB } from './pgUtils';
import { PG } from '@/types';
import { FloorAllocation } from '@/components/pg/PGFormRoomAllocation';

export const addPG = async (pgData: Omit<PG, 'id'>): Promise<PG> => {
  console.log('PG Service: Adding PG with data:', pgData);
  
  try {
    // Basic validation
    if (!pgData.name?.trim()) {
      throw new Error('PG name is required');
    }
    
    if (!pgData.location?.trim()) {
      throw new Error('Location is required');
    }
    
    if (!pgData.totalRooms || pgData.totalRooms < 1) {
      throw new Error('Total rooms must be at least 1');
    }

    if (!pgData.floors || pgData.floors < 1) {
      throw new Error('Number of floors must be at least 1');
    }

    // Handle manager ID validation - verify the manager exists if provided
    let managerId = null;
    if (pgData.managerId && pgData.managerId !== 'none' && pgData.managerId !== '') {
      console.log('Validating manager ID:', pgData.managerId);
      
      // Check if the manager exists in the users table
      const { data: managerExists, error: managerError } = await supabase
        .from('users')
        .select('id')
        .eq('id', pgData.managerId)
        .eq('role', 'manager')
        .single();

      if (managerError || !managerExists) {
        console.warn('Manager not found or error:', managerError);
        // Don't fail the PG creation, just set manager to null
        console.log('Creating PG without manager assignment');
        managerId = null;
      } else {
        console.log('Manager validated successfully:', managerExists.id);
        managerId = pgData.managerId;
      }
    }

    // Transform the PG data to match database schema with proper defaults
    const dbPGData = {
      name: pgData.name.trim(),
      description: pgData.contactInfo?.trim() || '',
      address: pgData.location.trim(),
      pg_type: pgData.type, // Map the type field correctly to pg_type
      manager_id: managerId,
      total_rooms: pgData.totalRooms,
      occupied_rooms: 0,
      monthly_rent: pgData.roomTypes?.[0]?.price || 0,
      amenities: pgData.roomTypes?.flatMap(rt => rt.amenities || []) || [],
      images: pgData.images || [],
      revenue: 0
    };

    console.log('PG Service: Transformed DB data:', dbPGData);

    // Insert the PG into the database
    const { data, error } = await supabase
      .from('pgs')
      .insert([dbPGData])
      .select()
      .single();

    if (error) {
      console.error('Database error when inserting PG:', error);
      logError('Error adding PG:', error);
      
      // Provide more specific error messages
      if (error.code === '23503') {
        throw new Error('Selected manager is not available. The PG was created without a manager assignment.');
      }
      
      throw new Error(`Failed to create PG: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from PG creation');
    }

    console.log('PG Service: PG added successfully to database:', data);
    
    // Transform back to application format
    const transformedPG = transformPGFromDB(data);
    
    // Create rooms for this PG based on the configuration
    try {
      if (pgData.totalRooms > 0) {
        console.log('PG Service: Creating rooms for new PG...');
        const roomAllocations = (pgData as any).roomAllocations as FloorAllocation[] | undefined;
        await createRoomsForPG(transformedPG.id, pgData, roomAllocations);
        console.log('PG Service: Rooms created successfully');
      }
    } catch (roomError) {
      console.error('Error creating rooms:', roomError);
      // Don't fail the entire PG creation if room creation fails
      console.warn('PG created but room creation failed - rooms can be added manually');
    }
    
    return transformedPG;
  } catch (error) {
    console.error('Error in addPG service:', error);
    logError('Error in addPG service:', error);
    throw error;
  }
};

// Enhanced helper function to create rooms for a new PG with allocation support
const createRoomsForPG = async (pgId: string, pgData: Omit<PG, 'id'>, roomAllocations?: FloorAllocation[]) => {
  try {
    const totalRooms = pgData.totalRooms;
    const roomTypes = pgData.roomTypes || [];
    const floors = pgData.floors || 1;
    
    console.log(`Creating ${totalRooms} rooms for PG ${pgId} across ${floors} floors`);
    
    if (roomAllocations && roomAllocations.length > 0) {
      // Use custom room allocation
      console.log('Using custom room allocation:', roomAllocations);
      
      let roomsCreated = 0;
      
      for (const allocation of roomAllocations) {
        const roomType = roomTypes.find(rt => rt.id === allocation.roomTypeId);
        if (!roomType) {
          console.warn(`Room type ${allocation.roomTypeId} not found, skipping allocation`);
          continue;
        }
        
        console.log(`Creating ${allocation.count} rooms of type ${roomType.name} on floor ${allocation.floor}`);
        
        // Create rooms for this allocation
        for (let i = 1; i <= allocation.count; i++) {
          const roomNumberOnFloor = i.toString().padStart(2, '0');
          const fullRoomNumber = `${allocation.floor}${roomNumberOnFloor}`;
          
          const roomData = {
            pg_id: pgId,
            room_number: fullRoomNumber,
            room_type: roomType.name,
            capacity: roomType.capacity,
            rent: roomType.price,
            status: 'available'
          };
          
          console.log('Creating room:', roomData);
          await addRoomToDatabase(roomData);
          roomsCreated++;
        }
      }
      
      // Check if we need to create additional unallocated rooms
      const remainingRooms = totalRooms - roomsCreated;
      
      if (remainingRooms > 0) {
        console.log(`Creating ${remainingRooms} additional rooms for unallocated space`);
        await createStandardRooms(pgId, remainingRooms, roomTypes, floors, roomsCreated + 1);
      }
    } else {
      // Use standard room creation logic
      await createStandardRooms(pgId, totalRooms, roomTypes, floors, 1);
    }
    
    console.log(`Successfully created rooms for PG ${pgId}`);
  } catch (error) {
    console.error('Error creating rooms for PG:', error);
    throw new Error(`Failed to create rooms: ${error.message}`);
  }
};

// Helper function to add room to database
const addRoomToDatabase = async (roomData: any) => {
  const { data, error } = await supabase
    .from('rooms')
    .insert([roomData])
    .select()
    .single();

  if (error) {
    console.error('Error creating room:', error);
    throw error;
  }

  return data;
};

// Helper function for standard room creation
const createStandardRooms = async (pgId: string, roomCount: number, roomTypes: any[], floors: number, startingRoomNumber: number = 1) => {
  const roomsPerFloor = Math.ceil(roomCount / floors);
  
  if (roomTypes.length === 0) {
    // Create standard rooms if no room types defined
    for (let i = 0; i < roomCount; i++) {
      const roomNumber = startingRoomNumber + i;
      const floor = Math.ceil(roomNumber / roomsPerFloor);
      const roomNumberOnFloor = ((roomNumber - 1) % roomsPerFloor + 1).toString().padStart(2, '0');
      
      const roomData = {
        pg_id: pgId,
        room_number: `${floor}${roomNumberOnFloor}`,
        room_type: 'Standard',
        capacity: 1,
        rent: 0,
        status: 'available'
      };
      
      await addRoomToDatabase(roomData);
    }
  } else {
    // Distribute rooms evenly among room types
    const roomsPerType = Math.floor(roomCount / roomTypes.length);
    const remainingRooms = roomCount % roomTypes.length;
    
    let roomNumber = startingRoomNumber;
    
    for (let i = 0; i < roomTypes.length; i++) {
      const roomType = roomTypes[i];
      const roomsToCreate = roomsPerType + (i < remainingRooms ? 1 : 0);
      
      for (let j = 0; j < roomsToCreate; j++) {
        const floor = Math.ceil(roomNumber / roomsPerFloor);
        const roomNumberOnFloor = ((roomNumber - 1) % roomsPerFloor + 1).toString().padStart(2, '0');
        
        const roomData = {
          pg_id: pgId,
          room_number: `${floor}${roomNumberOnFloor}`,
          room_type: roomType.name,
          capacity: roomType.capacity,
          rent: roomType.price,
          status: 'available'
        };
        
        await addRoomToDatabase(roomData);
        roomNumber++;
      }
    }
  }
};

export const updatePG = async (id: string, pgData: PG): Promise<PG> => {
  console.log('Updating PG with id:', id, 'and data:', pgData);
  console.log('PG Type being updated to:', pgData.type);
  
  try {
    // Handle manager ID validation - allow null/empty values
    let managerId = null;
    if (pgData.managerId && pgData.managerId !== 'none' && pgData.managerId !== '') {
      managerId = pgData.managerId;
    }

    // Transform the PG data to match database schema
    const dbPGData = {
      name: pgData.name,
      description: pgData.contactInfo || '',
      address: pgData.location || '',
      pg_type: pgData.type, // Ensure type field is properly mapped to pg_type
      manager_id: managerId,
      total_rooms: pgData.totalRooms || 0,
      occupied_rooms: pgData.actualOccupancy || 0,
      monthly_rent: pgData.roomTypes?.[0]?.price || pgData.revenue || 0,
      amenities: pgData.roomTypes?.flatMap(rt => rt.amenities || []) || [],
      images: pgData.images || [],
      revenue: pgData.revenue || 0,
      updated_at: new Date().toISOString()
    };

    console.log('PG Service: Transformed DB update data:', dbPGData);
    console.log('PG Service: pg_type field value:', dbPGData.pg_type);

    const { data, error } = await supabase
      .from('pgs')
      .update(dbPGData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error when updating PG:', error);
      logError('Error updating PG:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from PG update');
    }

    console.log('PG updated successfully in database:', data);
    console.log('Updated pg_type value in database:', data.pg_type);
    
    // Transform back to application format
    const transformedPG = transformPGFromDB(data);
    console.log('Transformed PG for frontend:', transformedPG);
    console.log('Final type value:', transformedPG.type);
    
    return transformedPG;
  } catch (error) {
    console.error('Error in updatePG service:', error);
    logError('Error in updatePG service:', error);
    throw error;
  }
};
