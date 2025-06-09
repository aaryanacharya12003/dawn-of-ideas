
import { Room } from '@/types';
import { addRoom, updateRoom, deleteRoom } from '@/services/roomService';

export const useRoomOperations = (refreshAllData: () => Promise<void>) => {
  const handleAddRoom = async (room: Omit<Room, 'id'>) => {
    console.log("DataContext: Adding room:", room.number);
    const roomData = {
      pg_id: room.pgId,
      room_number: room.number,
      room_type: room.type,
      capacity: room.capacity,
      rent: room.rent || 0,
      status: room.status || 'available'
    };
    await addRoom(roomData);
    await refreshAllData();
  };

  const handleUpdateRoom = async (room: Room) => {
    console.log("DataContext: Updating room:", room.number);
    const roomData = {
      id: room.id,
      pg_id: room.pgId,
      room_number: room.number,
      room_type: room.type,
      capacity: room.capacity,
      rent: room.rent || 0,
      status: room.status || 'available'
    };
    await updateRoom(roomData);
    await refreshAllData();
  };

  const handleDeleteRoom = async (roomId: string) => {
    console.log("DataContext: Deleting room:", roomId);
    await deleteRoom(roomId);
    await refreshAllData();
  };

  return {
    addRoom: handleAddRoom,
    updateRoom: handleUpdateRoom,
    deleteRoom: handleDeleteRoom
  };
};
