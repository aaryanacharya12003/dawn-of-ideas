
import { supabase } from '@/integrations/supabase/client';

export interface RoomTypeData {
  id: string;
  name: string;
  capacity: number;
  description: string;
}

// Room Types - using mock data since room_types table doesn't exist
export const fetchRoomTypes = async (): Promise<RoomTypeData[]> => {
  // Return default room types
  return [
    {
      id: '1',
      name: 'Single',
      capacity: 1,
      description: 'Single occupancy room',
    },
    {
      id: '2', 
      name: 'Double',
      capacity: 2,
      description: 'Double occupancy room',
    },
    {
      id: '3',
      name: 'Triple',
      capacity: 3,
      description: 'Triple occupancy room',
    }
  ];
};

export const addRoomType = async (roomType: Omit<RoomTypeData, 'id'>): Promise<RoomTypeData | null> => {
  // Mock implementation - return the roomType with generated ID
  return {
    id: Date.now().toString(),
    ...roomType,
  };
};

export const updateRoomType = async (roomType: RoomTypeData): Promise<boolean> => {
  // Mock implementation
  console.log('Updating room type:', roomType);
  return true;
};

export const deleteRoomType = async (id: string): Promise<boolean> => {
  // Mock implementation
  console.log('Deleting room type:', id);
  return true;
};
