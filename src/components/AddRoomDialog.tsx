
import React from 'react';
import ResponsiveRoomDialog from '@/components/room/ResponsiveRoomDialog';
import { Room } from '@/types';
import { useData } from '@/context/DataContext';

interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: Room | null;
}

const AddRoomDialog: React.FC<AddRoomDialogProps> = ({ open, onOpenChange, room }) => {
  const { addRoom, updateRoom } = useData();

  const handleSave = async (roomData: Omit<Room, 'id'> | Room) => {
    try {
      if ('id' in roomData && roomData.id) {
        await updateRoom(roomData as Room);
      } else {
        await addRoom(roomData as Omit<Room, 'id'>);
      }
    } catch (error) {
      console.error('Error saving room:', error);
      throw error;
    }
  };

  return (
    <ResponsiveRoomDialog
      open={open}
      onOpenChange={onOpenChange}
      room={room}
      onSave={handleSave}
    />
  );
};

export default AddRoomDialog;
