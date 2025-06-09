
import { supabase } from '@/integrations/supabase/client';

export interface RoomData {
  id?: string;
  pg_id: string;
  room_number: string;
  room_type: string;
  capacity: number;
  rent: number;
  status: string;
  occupant_name?: string;
  occupant_contact?: string;
}

export const fetchRooms = async (pgId?: string) => {
  try {
    let query = supabase
      .from('rooms')
      .select(`
        *,
        pgs (
          id,
          name,
          address
        )
      `)
      .order('room_number', { ascending: true });
    
    if (pgId) {
      query = query.eq('pg_id', pgId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }

    console.log('Fetched rooms with PG data:', data);
    return data || [];
  } catch (error) {
    console.error('Error in fetchRooms:', error);
    throw error;
  }
};

export const addRoom = async (roomData: RoomData) => {
  try {
    const { data, error } = await (supabase as any)
      .from('rooms')
      .insert([{
        pg_id: roomData.pg_id,
        room_number: roomData.room_number,
        room_type: roomData.room_type,
        capacity: roomData.capacity,
        rent: roomData.rent,
        status: roomData.status || 'available',
        occupant_name: roomData.occupant_name,
        occupant_contact: roomData.occupant_contact
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding room:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addRoom:', error);
    throw error;
  }
};

export const updateRoom = async (roomData: RoomData) => {
  try {
    if (!roomData.id) {
      throw new Error('Room ID is required for update');
    }

    console.log('Updating room with ID:', roomData.id);
    console.log('Room data:', roomData);

    // Check if the ID is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(roomData.id)) {
      console.error('Invalid UUID format for room ID:', roomData.id);
      throw new Error(`Invalid room ID format: ${roomData.id}. Expected UUID format.`);
    }

    const { data, error } = await (supabase as any)
      .from('rooms')
      .update({
        pg_id: roomData.pg_id,
        room_number: roomData.room_number,
        room_type: roomData.room_type,
        capacity: roomData.capacity,
        rent: roomData.rent,
        status: roomData.status,
        occupant_name: roomData.occupant_name,
        occupant_contact: roomData.occupant_contact
      })
      .eq('id', roomData.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating room:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateRoom:', error);
    throw error;
  }
};

export const deleteRoom = async (id: string) => {
  try {
    const { error } = await (supabase as any)
      .from('rooms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting room:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteRoom:', error);
    throw error;
  }
};

export const updateRoomCapacityBulk = async (pgId: string, roomType: string, newCapacity: number) => {
  try {
    const { data, error } = await (supabase as any)
      .from('rooms')
      .update({ capacity: newCapacity })
      .eq('pg_id', pgId)
      .eq('room_type', roomType)
      .select();

    if (error) {
      console.error('Error updating room capacities:', error);
      throw error;
    }

    console.log(`Updated ${data?.length || 0} rooms with new capacity ${newCapacity}`);
    return data;
  } catch (error) {
    console.error('Error in updateRoomCapacityBulk:', error);
    throw error;
  }
};

export const getRoomStatus = (room: RoomData) => {
  return room.status || 'available';
};
