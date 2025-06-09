
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Room, RoomStatus, PG } from '@/types';
import StatusBadge from './StatusBadge';
import RoomProgressBar from './RoomProgressBar';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

interface RoomsOverviewProps {
  rooms: Room[];
  getRoomStatus: (room: Room) => RoomStatus;
  onRoomClick: (room: Room) => void;
  pgId?: string; // Optional parameter to filter by specific PG
}

const RoomsOverview: React.FC<RoomsOverviewProps> = ({ 
  rooms: initialRooms, 
  getRoomStatus, 
  onRoomClick,
  pgId 
}) => {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const { user } = useAuth();
  const { pgs } = useData(); // Get fresh PG data from context
  
  // Update rooms when initialRooms or pgs change
  useEffect(() => {
    console.log("RoomsOverview: Updating rooms due to data change");
    console.log("Initial rooms:", initialRooms.length);
    console.log("PGs available:", pgs.length);
    
    // If specific PG is requested, use that regardless of user role
    if (pgId) {
      const filteredRooms = initialRooms.filter(room => room.pgId === pgId);
      console.log("Filtered rooms for PG", pgId, ":", filteredRooms.length);
      setRooms(filteredRooms);
      return;
    }
    
    // For managers, only show rooms they are assigned to
    if (user && user.role === 'manager') {
      // If manager has assignedPGs, filter by them
      if (user.assignedPGs && Array.isArray(user.assignedPGs) && user.assignedPGs.length > 0) {
        // Find the PG IDs that match the assigned PG names
        const assignedPgIds = initialRooms
          .filter(room => {
            const pgObject = pgs.find((pg: PG) => pg.id === room.pgId);
            return pgObject && user.assignedPGs?.includes(pgObject.name);
          })
          .map(room => room.pgId);
          
        // Then filter rooms by those PG IDs
        const filteredRooms = initialRooms.filter(room => assignedPgIds.includes(room.pgId));
        console.log("Manager filtered rooms:", filteredRooms.length);
        setRooms(filteredRooms);
      } else {
        // No assigned PGs, show no rooms
        setRooms([]);
      }
    } else {
      // Admin or other roles see all rooms
      setRooms(initialRooms);
    }
  }, [initialRooms, user, pgId, pgs]); // Add pgs as dependency

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Rooms Overview</h2>
      {rooms.length === 0 ? (
        <div className="bg-muted/30 rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No rooms available for your assigned PGs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map((room) => {
            // Calculate the correct status based on actual student occupancy
            const currentOccupancy = room.students?.length || 0;
            const roomCapacity = room.capacity || 1;
            const status = currentOccupancy > 0 
              ? (currentOccupancy >= roomCapacity ? 'full' as RoomStatus : 'partial' as RoomStatus) 
              : 'vacant' as RoomStatus;
              
            return (
              <Card 
                key={room.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onRoomClick(room)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Room {room.number}</h3>
                    <StatusBadge status={status} />
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm text-muted-foreground mb-1">
                      PG: {room.pgName || 'Unknown PG'}
                    </p>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Occupancy</span>
                      <span className="font-medium">{currentOccupancy}/{roomCapacity}</span>
                    </div>
                    <RoomProgressBar 
                      occupancy={currentOccupancy} 
                      capacity={roomCapacity} 
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RoomsOverview;
