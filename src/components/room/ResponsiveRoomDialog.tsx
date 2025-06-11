
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useData } from '@/context/DataContext';
import { Room, RoomStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

const roomFormSchema = z.object({
  number: z.string().min(1, { message: "Room number is required." }),
  type: z.string().min(1, { message: "Room type is required." }),
  capacity: z.number().min(1, { message: "Capacity must be at least 1." }),
  rent: z.number().min(0, { message: "Rent must be 0 or greater." }),
  pgId: z.string().min(1, { message: "Please select a PG." }),
  status: z.enum(['vacant', 'partial', 'full', 'maintenance']).optional()
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

interface ResponsiveRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: Room | null;
  onSave: (room: Omit<Room, 'id'> | Room) => Promise<void>;
}

const ResponsiveRoomDialog: React.FC<ResponsiveRoomDialogProps> = ({
  open,
  onOpenChange,
  room,
  onSave
}) => {
  const { pgs } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      number: '',
      type: '',
      capacity: 1,
      rent: 0,
      pgId: '',
      status: 'vacant'
    }
  });

  useEffect(() => {
    if (room) {
      form.reset({
        number: room.number,
        type: room.type,
        capacity: room.capacity,
        rent: room.rent || 0,
        pgId: room.pgId,
        status: (room.status as RoomStatus) || 'vacant'
      });
    } else {
      form.reset({
        number: '',
        type: '',
        capacity: 1,
        rent: 0,
        pgId: '',
        status: 'vacant'
      });
    }
  }, [room, form]);

  const onSubmit = async (data: RoomFormValues) => {
    setIsSubmitting(true);
    try {
      const roomData: Omit<Room, 'id'> | Room = {
        ...(room?.id && { id: room.id }),
        number: data.number,
        type: data.type,
        capacity: data.capacity,
        rent: data.rent,
        pgId: data.pgId,
        status: (data.status as RoomStatus) || 'vacant',
        students: room?.students || []
      };

      await onSave(roomData);
      onOpenChange(false);
      
      if (!room) {
        form.reset();
      }
      
      toast({
        title: "Success",
        description: `Room ${room ? 'updated' : 'created'} successfully.`
      });
    } catch (error) {
      console.error('Error saving room:', error);
      toast({
        title: "Error",
        description: `Failed to ${room ? 'update' : 'create'} room. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{room ? 'Edit Room' : 'Add New Room'}</DialogTitle>
          <DialogDescription>
            {room ? 'Update the room details below.' : 'Enter the details for the new room.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pgId"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>PG</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a PG" />
                        </SelectTrigger>
                        <SelectContent>
                          {pgs.map((pg) => (
                            <SelectItem key={pg.id} value={pg.id}>
                              {pg.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number</FormLabel>
                    <FormControl>
                      <Input placeholder="101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Double">Double</SelectItem>
                          <SelectItem value="Triple">Triple</SelectItem>
                          <SelectItem value="Quad">Quad</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Rent (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="5000" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vacant">Vacant</SelectItem>
                          <SelectItem value="partial">Partially Occupied</SelectItem>
                          <SelectItem value="full">Fully Occupied</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (room ? 'Updating...' : 'Creating...') : (room ? 'Update Room' : 'Create Room')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ResponsiveRoomDialog;
