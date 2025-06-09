
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from './StatusBadge';
import { Room, RoomStatus } from '@/types';

interface RoomCardProps {
  room: Room;
  status: RoomStatus;
  onClick: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, status, onClick }) => {
  // Calculate the correct occupancy based on actual student count
  const currentOccupancy = room.students?.length || 0;
  const roomCapacity = room.capacity || 1;
  const occupancyPercentage = Math.round((currentOccupancy / roomCapacity) * 100);
  
  // Calculate the correct status based on actual student occupancy
  const displayStatus = room.students && room.students.length > 0 
    ? (room.students.length >= room.capacity ? 'full' : 'partial') 
    : 'vacant';

  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Room {room.number}</CardTitle>
          <StatusBadge status={displayStatus as RoomStatus} />
        </div>
        <p className="text-sm text-muted-foreground">
          {room.pgName || 'Unknown PG'}
        </p>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="mt-2">
          <p className="text-lg font-medium">
            Room Occupancy: {currentOccupancy}/{roomCapacity}
          </p>
          <p className="text-sm text-muted-foreground">
            {occupancyPercentage}% occupied
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
