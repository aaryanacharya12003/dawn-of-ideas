import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoomType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useData } from '@/context/DataContext';
import { updateRoomCapacityBulk } from '@/services/roomService';

interface PGFormRoomTypesProps {
  roomTypes: RoomType[];
  setRoomTypes: React.Dispatch<React.SetStateAction<RoomType[]>>;
  pgId?: string; // Add pgId prop for bulk operations
}

const PGFormRoomTypes: React.FC<PGFormRoomTypesProps> = ({ roomTypes, setRoomTypes, pgId }) => {
  const { toast } = useToast();
  const { refreshAllData } = useData();
  const [newRoomType, setNewRoomType] = useState({
    name: '',
    capacity: 0,
    amenities: [''],
    price: 0
  });
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);
  const [newCapacity, setNewCapacity] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAddRoomType = () => {
    if (!newRoomType.name || newRoomType.capacity <= 0 || newRoomType.price <= 0) {
      toast({
        title: "Invalid Room Type",
        description: "Please provide valid name, capacity and price",
        variant: "destructive"
      });
      return;
    }
    
    const newType: RoomType = {
      id: Math.random().toString(36).substring(7),
      name: newRoomType.name,
      capacity: newRoomType.capacity,
      amenities: newRoomType.amenities.filter(a => a !== ''),
      price: newRoomType.price
    };
    
    setRoomTypes([...roomTypes, newType]);
    setNewRoomType({
      name: '',
      capacity: 0,
      amenities: [''],
      price: 0
    });
  };
  
  const handleRemoveRoomType = (id: string) => {
    setRoomTypes(roomTypes.filter(rt => rt.id !== id));
  };
  
  const handleAddAmenity = () => {
    setNewRoomType({
      ...newRoomType,
      amenities: [...newRoomType.amenities, '']
    });
  };
  
  const handleAmenityChange = (index: number, value: string) => {
    const updatedAmenities = [...newRoomType.amenities];
    updatedAmenities[index] = value;
    setNewRoomType({
      ...newRoomType,
      amenities: updatedAmenities
    });
  };
  
  const handleRemoveAmenity = (index: number) => {
    const updatedAmenities = [...newRoomType.amenities];
    updatedAmenities.splice(index, 1);
    setNewRoomType({
      ...newRoomType,
      amenities: updatedAmenities
    });
  };

  const openBulkEdit = () => {
    if (roomTypes.length === 0) {
      toast({
        title: "No Room Types",
        description: "Add room types first before using bulk edit",
        variant: "destructive"
      });
      return;
    }
    setSelectedRoomType(roomTypes[0].id);
    setNewCapacity(roomTypes[0].capacity);
    setBulkEditOpen(true);
  };

  const handleBulkCapacityUpdate = async () => {
    if (!selectedRoomType || newCapacity <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select a room type and enter a valid capacity",
        variant: "destructive"
      });
      return;
    }

    const selectedType = roomTypes.find(rt => rt.id === selectedRoomType);
    if (!selectedType) {
      toast({
        title: "Error",
        description: "Selected room type not found",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      // Update the room type in the local state
      const updatedRoomTypes = roomTypes.map(rt => 
        rt.id === selectedRoomType ? { ...rt, capacity: newCapacity } : rt
      );
      setRoomTypes(updatedRoomTypes);

      // If we have a pgId (editing existing PG), update actual rooms in database
      if (pgId) {
        console.log("Updating room capacities for PG:", pgId, "Room type:", selectedType.name, "New capacity:", newCapacity);
        await updateRoomCapacityBulk(pgId, selectedType.name, newCapacity);
        await refreshAllData(); // Refresh all data to sync changes
        
        toast({
          title: "Bulk Update Successful",
          description: `All ${selectedType.name} rooms updated to capacity ${newCapacity}`,
        });
      } else {
        toast({
          title: "Room Type Updated",
          description: `Room type capacity updated to ${newCapacity}. Changes will apply when PG is saved.`,
        });
      }
      
      setBulkEditOpen(false);
    } catch (error) {
      console.error('Error in bulk capacity update:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update room capacities. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium mb-2">Room Types</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openBulkEdit}
          disabled={roomTypes.length === 0}
        >
          Bulk Edit Capacity
        </Button>
      </div>
      {roomTypes.length > 0 ? (
        <div className="space-y-2">
          {roomTypes.map(roomType => (
            <div key={roomType.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
              <div>
                <strong>{roomType.name}</strong> - {roomType.capacity} person(s), ₹{roomType.price}
                <div className="text-xs text-muted-foreground">
                  Amenities: {roomType.amenities.join(', ') || 'None'}
                </div>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => handleRemoveRoomType(roomType.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground text-sm">No room types added yet.</div>
      )}
      
      <div className="border border-dashed border-gray-300 p-4 rounded-md">
        <h4 className="text-md font-medium mb-2">Add New Room Type</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input 
              placeholder="e.g. Single Room, Double Sharing" 
              value={newRoomType.name}
              onChange={e => setNewRoomType({...newRoomType, name: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Capacity</label>
            <Input 
              type="number" 
              min={1} 
              value={newRoomType.capacity || ''}
              onChange={e => setNewRoomType({...newRoomType, capacity: parseInt(e.target.value)})}
            />
          </div>
        </div>
        
        <div className="mb-2">
          <label className="text-sm font-medium">Price (₹)</label>
          <Input 
            type="number" 
            min={0} 
            value={newRoomType.price || ''}
            onChange={e => setNewRoomType({...newRoomType, price: parseInt(e.target.value)})}
          />
        </div>
        
        <div className="space-y-2 mb-2">
          <label className="text-sm font-medium">Amenities</label>
          {newRoomType.amenities.map((amenity, index) => (
            <div key={index} className="flex gap-2">
              <Input 
                placeholder="e.g. AC, Attached Bathroom" 
                value={amenity}
                onChange={e => handleAmenityChange(index, e.target.value)}
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => handleRemoveAmenity(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={handleAddAmenity}
            className="flex items-center text-primary"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Amenity
          </Button>
        </div>
        
        <Button 
          type="button" 
          onClick={handleAddRoomType}
          variant="secondary"
          className="w-full mt-2"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Room Type
        </Button>
      </div>

      {/* Bulk Edit Dialog */}
      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bulk Edit Room Capacity</DialogTitle>
            <DialogDescription>
              Update the capacity for all rooms of a specific type.
              {pgId && " This will update existing rooms in the database."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="room-type" className="text-right">
                Room Type
              </Label>
              <Select 
                value={selectedRoomType || ''} 
                onValueChange={setSelectedRoomType}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity" className="text-right">
                New Capacity
              </Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                value={newCapacity || ''}
                onChange={e => setNewCapacity(parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkEditOpen(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button type="button" onClick={handleBulkCapacityUpdate} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Capacity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PGFormRoomTypes;
