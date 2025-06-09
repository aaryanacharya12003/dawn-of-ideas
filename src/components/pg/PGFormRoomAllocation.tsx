
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RoomType } from '@/types';
import { Trash2, Plus } from 'lucide-react';

export interface FloorAllocation {
  floor: number;
  roomTypeId: string;
  roomTypeName: string;
  count: number;
  capacity: number;
}

interface PGFormRoomAllocationProps {
  roomTypes: RoomType[];
  floors: number;
  totalRooms: number;
  allocations: FloorAllocation[];
  setAllocations: React.Dispatch<React.SetStateAction<FloorAllocation[]>>;
}

const PGFormRoomAllocation: React.FC<PGFormRoomAllocationProps> = ({
  roomTypes,
  floors,
  totalRooms,
  allocations,
  setAllocations
}) => {
  const [newAllocation, setNewAllocation] = useState({
    floor: 1,
    roomTypeId: '',
    count: 1
  });
  const [isAutoAllocated, setIsAutoAllocated] = useState(false);

  // Calculate total allocated rooms
  const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.count, 0);
  const remainingRooms = totalRooms - totalAllocated;

  const handleAddAllocation = () => {
    if (!newAllocation.roomTypeId) return;

    const selectedRoomType = roomTypes.find(rt => rt.id === newAllocation.roomTypeId);
    if (!selectedRoomType) return;

    // Check if adding this allocation would exceed total rooms
    if (totalAllocated + newAllocation.count > totalRooms) {
      alert(`Cannot allocate ${newAllocation.count} rooms. Only ${remainingRooms} rooms remaining.`);
      return;
    }

    const allocation: FloorAllocation = {
      floor: newAllocation.floor,
      roomTypeId: newAllocation.roomTypeId,
      roomTypeName: selectedRoomType.name,
      count: newAllocation.count,
      capacity: selectedRoomType.capacity
    };

    setAllocations([...allocations, allocation]);
    setNewAllocation({
      floor: 1,
      roomTypeId: '',
      count: 1
    });
  };

  const handleRemoveAllocation = (index: number) => {
    const updatedAllocations = allocations.filter((_, i) => i !== index);
    setAllocations(updatedAllocations);
    
    // If all allocations are removed, reset auto-allocated state
    if (updatedAllocations.length === 0) {
      setIsAutoAllocated(false);
    }
  };

  const handleAutoAllocate = () => {
    if (roomTypes.length === 0) return;

    // Clear existing allocations
    setAllocations([]);

    // Distribute rooms evenly across floors and room types
    const roomsPerFloor = Math.floor(totalRooms / floors);
    const extraRooms = totalRooms % floors;
    
    const newAllocations: FloorAllocation[] = [];

    for (let floor = 1; floor <= floors; floor++) {
      const roomsOnThisFloor = roomsPerFloor + (floor <= extraRooms ? 1 : 0);
      
      if (roomsOnThisFloor > 0 && roomTypes.length > 0) {
        // Use the first room type or distribute among available types
        const roomType = roomTypes[0];
        newAllocations.push({
          floor,
          roomTypeId: roomType.id,
          roomTypeName: roomType.name,
          count: roomsOnThisFloor,
          capacity: roomType.capacity
        });
      }
    }

    setAllocations(newAllocations);
    setIsAutoAllocated(true);
  };

  // Reset auto-allocated state when allocations are manually modified
  useEffect(() => {
    // Check if allocations were manually modified (not auto-allocated)
    if (!isAutoAllocated && allocations.length > 0) {
      setIsAutoAllocated(false);
    }
  }, [allocations, isAutoAllocated]);

  // Group allocations by floor
  const allocationsByFloor = allocations.reduce((acc, allocation) => {
    if (!acc[allocation.floor]) {
      acc[allocation.floor] = [];
    }
    acc[allocation.floor].push(allocation);
    return acc;
  }, {} as Record<number, FloorAllocation[]>);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Room Allocation by Floor</h3>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoAllocate}
            disabled={roomTypes.length === 0}
          >
            Auto Allocate
          </Button>
          <span className="text-sm text-muted-foreground">
            {totalAllocated}/{totalRooms} rooms allocated
          </span>
        </div>
      </div>

      {roomTypes.length === 0 && (
        <div className="text-sm text-muted-foreground p-4 border rounded-lg">
          Please add room types first before allocating rooms to floors.
        </div>
      )}

      {roomTypes.length > 0 && (
        <>
          {/* Add New Allocation - Hidden when auto-allocated or when all rooms are allocated */}
          {!isAutoAllocated && remainingRooms > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Add Room Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Floor</Label>
                    <Select 
                      value={newAllocation.floor.toString()} 
                      onValueChange={(value) => setNewAllocation({...newAllocation, floor: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: floors}, (_, i) => i + 1).map(floor => (
                          <SelectItem key={floor} value={floor.toString()}>
                            Floor {floor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Room Type</Label>
                    <Select 
                      value={newAllocation.roomTypeId} 
                      onValueChange={(value) => setNewAllocation({...newAllocation, roomTypeId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name} (Capacity: {type.capacity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Number of Rooms</Label>
                    <Input
                      type="number"
                      min={1}
                      max={remainingRooms}
                      value={newAllocation.count}
                      onChange={(e) => setNewAllocation({...newAllocation, count: parseInt(e.target.value) || 1})}
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleAddAllocation}
                      disabled={!newAllocation.roomTypeId || remainingRooms <= 0}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Allocations */}
          {allocations.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Current Allocations</h4>
                {isAutoAllocated && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAutoAllocated(false)}
                  >
                    Manual Edit
                  </Button>
                )}
              </div>
              
              {Array.from({length: floors}, (_, i) => i + 1).map(floorNum => {
                const floorAllocations = allocationsByFloor[floorNum] || [];
                const floorTotal = floorAllocations.reduce((sum, a) => sum + a.count, 0);
                
                return (
                  <Card key={floorNum} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex justify-between">
                        Floor {floorNum}
                        <span className="text-sm font-normal text-muted-foreground">
                          {floorTotal} rooms
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {floorAllocations.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No rooms allocated</div>
                      ) : (
                        <div className="space-y-2">
                          {floorAllocations.map((allocation, index) => {
                            const globalIndex = allocations.findIndex(a => 
                              a.floor === allocation.floor && 
                              a.roomTypeId === allocation.roomTypeId && 
                              a.count === allocation.count
                            );
                            
                            return (
                              <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                                <div className="text-sm">
                                  <strong>{allocation.roomTypeName}</strong> - {allocation.count} rooms 
                                  (Capacity: {allocation.capacity} each)
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveAllocation(globalIndex)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Summary - Show different messages based on allocation status */}
          {remainingRooms > 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm text-yellow-800">
                <strong>Note:</strong> {remainingRooms} rooms still need to be allocated. 
                Unallocated rooms will be distributed automatically when the PG is created.
              </div>
            </div>
          ) : totalAllocated === totalRooms ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-800">
                <strong>✓ Complete:</strong> All {totalRooms} rooms have been allocated successfully.
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default PGFormRoomAllocation;
