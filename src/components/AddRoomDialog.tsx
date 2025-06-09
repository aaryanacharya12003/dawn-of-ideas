import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Room } from '@/types';
import { RoomData } from '@/services/roomService';
import { useToast } from '@/hooks/use-toast';
import { fetchPGs } from '@/services/pg';
import { addRoom, updateRoom } from '@/services/roomService'; 
import { Checkbox } from '@/components/ui/checkbox';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from '@/hooks/use-mobile';
import { AlertCircle } from 'lucide-react';

interface AddRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRoom: (room: Room) => void;
  initialPgId?: string;
  editRoom?: Room; // Optional prop for editing
}

const COMMON_AMENITIES = [
  "AC", "Non-AC", "Attached Bathroom", "Shared Bathroom", 
  "Balcony", "Hot Water", "WiFi", "Study Table", "Wardrobe"
];

const AddRoomDialog: React.FC<AddRoomDialogProps> = ({ 
  isOpen, 
  onClose, 
  onAddRoom, 
  initialPgId, 
  editRoom 
}) => {
  const [number, setNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [type, setType] = useState('');
  const [capacity, setCapacity] = useState(1);
  const [rent, setRent] = useState(0);
  const [status, setStatus] = useState<"vacant" | "partial" | "full" | "maintenance">("vacant");
  const [pgId, setPgId] = useState(initialPgId || '');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [pgs, setPgs] = useState([]);
  const [loadingPGs, setLoadingPGs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Check if we're in edit mode
  const isEditMode = !!editRoom;

  useEffect(() => {
    const loadPGs = async () => {
      setLoadingPGs(true);
      try {
        const fetchedPGs = await fetchPGs();
        console.log("Fetched PGs in AddRoomDialog:", fetchedPGs);
        setPgs(fetchedPGs);
        if (initialPgId) {
          setPgId(initialPgId);
        } else if (fetchedPGs.length > 0) {
          setPgId(fetchedPGs[0].id);
        }
      } catch (error) {
        console.error("Error loading PGs:", error);
        toast({
          title: "Error",
          description: "Failed to load PGs. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoadingPGs(false);
      }
    };

    if (isOpen) {
      loadPGs();
      setError(null);
      
      // If editing, populate the form with existing room data
      if (editRoom) {
        setNumber(editRoom.number);
        setFloor(editRoom.floor || 1);
        setType(editRoom.type || '');
        setCapacity(editRoom.capacity);
        setRent(0); // Default rent since Room interface doesn't have rent
        setStatus(editRoom.status || 'vacant');
        setPgId(editRoom.pgId);
        setSelectedAmenities(editRoom.amenities || []);
      }
    }
  }, [initialPgId, toast, isOpen, editRoom]);

  const convertRoomToRoomData = (room: Room): RoomData => {
    return {
      id: room.id,
      pg_id: room.pgId,
      room_number: room.number,
      room_type: room.type || '',
      capacity: room.capacity,
      rent: rent, // Use the rent from form state
      status: room.status || 'vacant',
      occupant_name: undefined,
      occupant_contact: undefined
    };
  };

  const convertRoomDataToRoom = (roomData: any): Room => {
    return {
      id: roomData.id,
      number: roomData.room_number,
      floor: floor,
      type: roomData.room_type,
      capacity: roomData.capacity,
      status: roomData.status,
      pgId: roomData.pg_id,
      amenities: selectedAmenities,
      students: editRoom?.students || []
    };
  };

  const handleSubmit = async () => {
    setError(null);
    
    if (!number || !type || !pgId) {
      setError("Please fill in all required fields.");
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Additional validation for edit mode
    if (isEditMode && editRoom) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(editRoom.id)) {
        setError("Cannot update room: Invalid room ID format. This room may need to be recreated.");
        toast({
          title: "Error",
          description: "Cannot update room: Invalid room ID format. This room may need to be recreated.",
          variant: "destructive"
        });
        return;
      }
    }

    setSubmitting(true);

    const roomData: RoomData = {
      id: editRoom?.id || undefined,
      pg_id: pgId,
      room_number: number,
      room_type: type,
      capacity: capacity,
      rent: rent,
      status: status,
      occupant_name: undefined,
      occupant_contact: undefined
    };

    console.log(isEditMode ? "Updating room:" : "Submitting new room:", roomData);

    try {
      let result;
      
      if (isEditMode) {
        // Update existing room
        result = await updateRoom(roomData);
        if (result) {
          const convertedRoom = convertRoomDataToRoom(result);
          toast({
            title: "Success",
            description: `Room ${number} has been updated successfully.`
          });
          onAddRoom(convertedRoom); // Pass the updated room data
        } else {
          throw new Error("Failed to update room");
        }
      } else {
        // Add new room
        result = await addRoom(roomData);
        if (result) {
          const convertedRoom = convertRoomDataToRoom(result);
          toast({
            title: "Success",
            description: `Room ${number} has been added successfully.`
          });
          onAddRoom(convertedRoom); // Pass the added room with generated ID
        } else {
          throw new Error("Failed to add room - no response from server");
        }
      }
      
      // Reset form if adding new room
      if (!isEditMode) {
        setNumber('');
        setFloor(1);
        setType('');
        setCapacity(1);
        setRent(0);
        setStatus('vacant');
        setSelectedAmenities([]);
      }
      
      onClose();
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} room:`, error);
      
      let errorMessage = error.message || 
        (error.error?.message) || 
        `Failed to ${isEditMode ? 'update' : 'add'} room. Please check your database connection and permissions.`;
      
      // Special handling for UUID errors
      if (errorMessage.includes('Invalid room ID format')) {
        errorMessage = "This room has an invalid ID format and cannot be updated. You may need to delete and recreate it.";
      } else if (errorMessage.includes('invalid input syntax for type uuid')) {
        errorMessage = "Room ID format error. This room may need to be recreated with a proper ID.";
      }
      
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const formContent = (
    <div className="grid gap-4 py-4">
      {error && (
        <div className="bg-destructive/15 p-3 rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm text-destructive">{error}</div>
        </div>
      )}
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="number" className="text-right">
          Room Number
        </Label>
        <Input id="number" value={number} onChange={(e) => setNumber(e.target.value)} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="floor" className="text-right">
          Floor
        </Label>
        <Input
          type="number"
          id="floor"
          value={floor}
          onChange={(e) => setFloor(parseInt(e.target.value) || 1)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="type" className="text-right">
          Room Type
        </Label>
        <Input id="type" value={type} onChange={(e) => setType(e.target.value)} className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="capacity" className="text-right">
          Capacity
        </Label>
        <Input
          type="number"
          id="capacity"
          value={capacity}
          onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="rent" className="text-right">
          Rent
        </Label>
        <Input
          type="number"
          id="rent"
          value={rent}
          onChange={(e) => setRent(parseFloat(e.target.value) || 0)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">
          Status
        </Label>
        <Select value={status} onValueChange={(value) => setStatus(value as "vacant" | "partial" | "full" | "maintenance")} >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vacant">Vacant</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="full">Full</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="pg" className="text-right">
          PG
        </Label>
        <Select value={pgId} onValueChange={setPgId} disabled={loadingPGs}>
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select PG" />
          </SelectTrigger>
          <SelectContent>
            {loadingPGs ? (
              <SelectItem value="loading" disabled>Loading PGs...</SelectItem>
            ) : (
              pgs.map((pg) => (
                <SelectItem key={pg.id} value={pg.id}>{pg.name}</SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right pt-2">
          Amenities
        </Label>
        <div className="col-span-3 grid grid-cols-2 gap-2">
          {COMMON_AMENITIES.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox 
                id={`amenity-${amenity}`} 
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
              />
              <label 
                htmlFor={`amenity-${amenity}`}
                className="text-sm cursor-pointer"
              >
                {amenity}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const footerContent = (
    <>
      <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
        Cancel
      </Button>
      <Button type="submit" onClick={handleSubmit} disabled={submitting}>
        {submitting ? (isEditMode ? "Updating..." : "Adding...") : (isEditMode ? "Update Room" : "Add Room")}
      </Button>
    </>
  );

  // Use Drawer on mobile and Dialog on larger screens
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{isEditMode ? "Edit Room" : "Add New Room"}</DrawerTitle>
            <DrawerDescription>
              {isEditMode ? "Update the room details below." : "Complete the form below to add a new room."}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            {formContent}
            <div className="mt-6 flex justify-end gap-2 pb-6">
              {footerContent}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Room" : "Add New Room"}</DialogTitle>
        </DialogHeader>
        {formContent}
        <DialogFooter>
          {footerContent}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRoomDialog;
