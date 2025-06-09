import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, DoorOpen, Users, Trash2, Edit, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Room, PG } from '@/types';
import AddRoomDialog from '@/components/AddRoomDialog';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';

const RoomManagement = () => {
  const [selectedPG, setSelectedPG] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addRoomDialogOpen, setAddRoomDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use the unified DataContext for all data operations
  const { 
    pgs, 
    rooms, 
    isLoading, 
    addRoom,
    updateRoom,
    deleteRoom,
    refreshAllData 
  } = useData();

  // Filter PGs based on user permissions
  const filteredPGs = user?.role === 'manager' && user.assignedPGs
    ? pgs.filter(pg => user.assignedPGs?.includes(pg.name))
    : pgs;

  // Filter rooms based on selected PG and search
  const filteredRooms = rooms.filter(room => {
    // Filter by PG
    if (selectedPG !== "all" && room.pgId !== selectedPG) return false;
    
    // Filter by status tab
    if (activeTab !== "all" && room.status !== activeTab) return false;
    
    // Filter by search query
    if (searchQuery && !room.number.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // For managers, only show rooms from their assigned PGs
    if (user?.role === 'manager' && user.assignedPGs) {
      const roomPG = pgs.find(pg => pg.id === room.pgId);
      if (!roomPG || !user.assignedPGs.includes(roomPG.name)) return false;
    }
    
    return true;
  });

  useEffect(() => {
    // Set default PG for managers with only one assigned PG
    if (user?.role === 'manager' && filteredPGs.length === 1) {
      setSelectedPG(filteredPGs[0].id);
    }
  }, [user, filteredPGs]);

  const handleAddRoom = async (room: Room) => {
    try {
      await addRoom(room);
      setAddRoomDialogOpen(false);
      toast({
        title: "Success",
        description: `Room ${room.number} has been added successfully.`
      });
    } catch (error) {
      console.error("Error adding room:", error);
      toast({
        title: "Error",
        description: "Failed to add room. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateRoom = async (room: Room) => {
    try {
      await updateRoom(room);
      setEditDialogOpen(false);
      setSelectedRoom(null);
      toast({
        title: "Success",
        description: `Room ${room.number} has been updated successfully.`
      });
    } catch (error) {
      console.error("Error updating room:", error);
      toast({
        title: "Error",
        description: "Failed to update room. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;
    
    try {
      await deleteRoom(selectedRoom.id);
      setDeleteDialogOpen(false);
      setSelectedRoom(null);
      toast({
        title: "Success",
        description: `Room ${selectedRoom.number} has been deleted successfully.`
      });
    } catch (error) {
      console.error("Error deleting room:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete room. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room);
    setViewDialogOpen(true);
  };

  const handleEditClick = (room: Room) => {
    setSelectedRoom(room);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (room: Room) => {
    setSelectedRoom(room);
    setDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'full':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Full</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Partially Occupied</Badge>;
      case 'vacant':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Vacant</Badge>;
      case 'maintenance':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Under Maintenance</Badge>;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'full':
        return 'bg-red-500';
      case 'partial':
        return 'bg-yellow-500';
      case 'vacant':
        return 'bg-green-500';
      case 'maintenance':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (user?.role === 'manager' && filteredPGs.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Room Management</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DoorOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No PGs Assigned</h2>
            <p className="text-center text-muted-foreground mb-4">
              You don't have any PGs assigned to your account. Please contact an administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Room Management</h1>
        <Button onClick={() => setAddRoomDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Room
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by room number..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={selectedPG} onValueChange={setSelectedPG}>
            <SelectTrigger>
              <SelectValue placeholder="All PGs" />
            </SelectTrigger>
            <SelectContent>
              {user?.role === 'admin' && <SelectItem value="all">All PGs ({pgs.length})</SelectItem>}
              {filteredPGs.length > 0 ? (
                filteredPGs.map(pg => (
                  <SelectItem key={pg.id} value={pg.id}>
                    {pg.name} ({rooms.filter(r => r.pgId === pg.id).length} rooms)
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="nopgs" disabled>No PGs available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Rooms ({filteredRooms.length})</TabsTrigger>
          <TabsTrigger value="vacant">Vacant ({filteredRooms.filter(r => r.status === 'vacant').length})</TabsTrigger>
          <TabsTrigger value="partial">Partially Occupied ({filteredRooms.filter(r => r.status === 'partial').length})</TabsTrigger>
          <TabsTrigger value="full">Fully Occupied ({filteredRooms.filter(r => r.status === 'full').length})</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance ({filteredRooms.filter(r => r.status === 'maintenance').length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <p>Loading rooms...</p>
            </div>
          ) : filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRooms.map(room => {
                const pgName = pgs.find(pg => pg.id === room.pgId)?.name || "Unknown PG";
                const currentOccupancy = room.students?.length || 0;
                const roomCapacity = room.capacity || 1;
                const occupancyPercentage = (currentOccupancy / roomCapacity) * 100;
                
                return (
                  <Card key={room.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className={`h-2 ${getStatusColor(room.status || 'vacant')}`}></div>
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <DoorOpen className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">Room {room.number}</h3>
                              <p className="text-sm text-muted-foreground">{room.type || "Standard Room"}</p>
                            </div>
                          </div>
                          {getStatusBadge(room.status || 'vacant')}
                        </div>
                        
                        <div className="mt-4">
                          <p className="text-sm font-medium">{pgName}</p>
                          <p className="text-sm text-muted-foreground">Capacity: {roomCapacity} persons</p>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Room Occupancy</span>
                            <span className="text-sm font-medium">
                              {currentOccupancy}/{roomCapacity} ({Math.round(occupancyPercentage)}%)
                            </span>
                          </div>
                          <Progress 
                            value={occupancyPercentage} 
                            className="h-2 mt-1"
                          />
                        </div>
                        
                        {room.students && room.students.length > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Current Residents</span>
                            </div>
                            <div className="mt-1 space-y-1">
                              {room.students.slice(0, 2).map(resident => (
                                <div 
                                  key={resident.id} 
                                  className="text-sm bg-muted/50 px-2 py-1 rounded-md"
                                >
                                  {resident.name}
                                </div>
                              ))}
                              {room.students.length > 2 && (
                                <div className="text-xs text-muted-foreground">
                                  +{room.students.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-6 flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewRoom(room)}>
                            <Eye className="h-4 w-4 mr-1" />View
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditClick(room)}>
                            <Edit className="h-4 w-4 mr-1" />Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDeleteClick(room)}>
                            <Trash2 className="h-4 w-4 mr-1" />Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted/40 rounded-full p-4 mb-4">
                <DoorOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No Rooms Found</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-2">
                {selectedPG !== "all" 
                  ? `No rooms found for the selected PG. ${pgs.find(pg => pg.id === selectedPG)?.name} may not have any rooms created yet.`
                  : "No rooms match your current filters. Try adjusting your search criteria or add a new room."
                }
              </p>
              <Button className="mt-4" onClick={() => setAddRoomDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add New Room
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <AddRoomDialog
        isOpen={addRoomDialogOpen}
        onClose={() => setAddRoomDialogOpen(false)}
        onAddRoom={handleAddRoom}
        initialPgId={selectedPG !== "all" ? selectedPG : undefined}
      />

      {/* Edit Room Dialog - Fixed prop name from 'room' to 'editRoom' */}
      {selectedRoom && (
        <AddRoomDialog
          isOpen={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedRoom(null);
          }}
          onAddRoom={handleUpdateRoom}
          editRoom={selectedRoom}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Room {selectedRoom?.number}? 
              {selectedRoom?.students && selectedRoom.students.length > 0 && 
                " This room has students assigned to it."}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoom} className="bg-destructive hover:bg-destructive/90">
              Delete Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* View Room Dialog */}
      {selectedRoom && (
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Room Details - {selectedRoom.number}</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Room Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Room Number:</span>
                    <span>{selectedRoom.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <span>{selectedRoom.type || "Standard Room"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Capacity:</span>
                    <span>{selectedRoom.capacity} persons</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span>{getStatusBadge(selectedRoom.status || 'vacant')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">PG:</span>
                    <span>{pgs.find(pg => pg.id === selectedRoom.pgId)?.name || "Unknown"}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Occupancy</h3>
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Occupancy Rate</span>
                    <span className="text-sm font-medium">
                      {selectedRoom.students?.length || 0}/{selectedRoom.capacity}
                    </span>
                  </div>
                  <Progress 
                    value={((selectedRoom.students?.length || 0) / selectedRoom.capacity) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-2">Students</h3>
                {selectedRoom.students && selectedRoom.students.length > 0 ? (
                  <div className="border rounded overflow-hidden">
                    <table className="min-w-full divide-y">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupation</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedRoom.students.map(student => (
                          <tr key={student.id}>
                            <td className="px-4 py-2 whitespace-nowrap">{student.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{student.phone}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{student.occupation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No students assigned to this room.</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RoomManagement;
