
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PG, RoomType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { updateRoomCapacityBulk } from '@/services/roomService';
import { PGFormValues } from '@/components/pg/types';
import { FloorAllocation } from '@/components/pg/PGFormRoomAllocation';

interface UsePGFormSubmitProps {
  form: UseFormReturn<PGFormValues>;
  managers: any[];
  roomTypes: RoomType[];
  roomAllocations: FloorAllocation[];
  images: string[];
  originalRoomTypes: RoomType[];
  isEdit: boolean;
  pg?: PG;
  onSave: (pg: Omit<PG, 'id'> | PG) => Promise<boolean>;
  onClose: () => void;
}

export const usePGFormSubmit = ({
  form,
  managers,
  roomTypes,
  roomAllocations,
  images,
  originalRoomTypes,
  isEdit,
  pg,
  onSave,
  onClose
}: UsePGFormSubmitProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateRoomCapacities = async (pgId: string) => {
    try {
      for (const currentRoomType of roomTypes) {
        const originalRoomType = originalRoomTypes.find(rt => rt.id === currentRoomType.id);
        
        if (originalRoomType && originalRoomType.capacity !== currentRoomType.capacity) {
          console.log(`Updating capacity for room type ${currentRoomType.name} from ${originalRoomType.capacity} to ${currentRoomType.capacity}`);
          
          await updateRoomCapacityBulk(pgId, currentRoomType.name, currentRoomType.capacity);
          
          toast({
            title: 'Room Capacities Updated',
            description: `All rooms of type ${currentRoomType.name} now have a capacity of ${currentRoomType.capacity}`
          });
        }
      }
    } catch (error) {
      console.error('Error updating room capacities:', error);
      toast({
        title: 'Warning',
        description: 'Room capacity updates may not have been fully applied to all rooms.',
        variant: 'destructive'
      });
    }
  };

  const onSubmit = async (values: PGFormValues) => {
    if (isSubmitting) {
      console.log("usePGFormSubmit: Already submitting, ignoring duplicate submission");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("usePGFormSubmit: Form submission started with values:", values);

      // Comprehensive validation with specific error messages
      const validationErrors: string[] = [];

      if (!values.name?.trim()) {
        validationErrors.push('PG name is required');
      }

      if (!values.location?.trim()) {
        validationErrors.push('Location is required');
      }

      if (!values.totalRooms || values.totalRooms < 1) {
        validationErrors.push('Total rooms must be at least 1');
      }

      if (!values.floors || values.floors < 1) {
        validationErrors.push('Number of floors must be at least 1');
      }

      if (!values.type || !['male', 'female', 'unisex'].includes(values.type)) {
        validationErrors.push('Please select a valid PG type (Male, Female, or Unisex)');
      }

      if (validationErrors.length > 0) {
        toast({
          title: 'Validation Errors',
          description: validationErrors.join(', '),
          variant: 'destructive'
        });
        return;
      }

      let selectedManager = null;
      if (values.managerId && values.managerId !== 'none' && values.managerId !== '') {
        selectedManager = managers.find(m => m.id === values.managerId);
        if (!selectedManager) {
          console.warn("usePGFormSubmit: Selected manager not found in available managers");
          toast({
            title: 'Warning',
            description: 'Selected manager is not available. Creating PG without manager assignment.',
            variant: 'destructive'
          });
        } else {
          console.log("usePGFormSubmit: Selected manager:", selectedManager);
        }
      }
      
      let pgData: PG | Omit<PG, 'id'> = {
        name: values.name.trim(),
        type: values.type as 'male' | 'female' | 'unisex',
        location: values.location.trim(),
        contactInfo: values.contactInfo?.trim() || '',
        totalRooms: Math.max(1, values.totalRooms),
        totalBeds: Math.max(1, values.totalBeds),
        floors: Math.max(1, values.floors),
        images: images || [],
        amenities: [],
        roomTypes: roomTypes.map(rt => ({
          id: rt.id,
          name: rt.name,
          capacity: rt.capacity,
          amenities: Array.isArray(rt.amenities) ? rt.amenities : [],
          price: rt.price
        })),
        revenue: pg?.revenue || 0,
        occupancyRate: pg?.occupancyRate || 0,
        monthlyRent: pg?.monthlyRent || 0,
        actualOccupancy: pg?.actualOccupancy || 0,
        totalCapacity: pg?.totalCapacity || 0,
        managerId: selectedManager?.id || null,
        manager: selectedManager?.name || null
      };
      
      console.log("usePGFormSubmit: Final PG data before save:", pgData);
      
      if (!isEdit && roomAllocations.length > 0) {
        (pgData as any).roomAllocations = roomAllocations;
        console.log("usePGFormSubmit: Added room allocations to PG data");
      } else if (isEdit && pg) {
        await updateRoomCapacities(pg.id);
      }
      
      if (isEdit && pg) {
        (pgData as PG).id = pg.id;
      }
      
      console.log("usePGFormSubmit: Calling onSave with data:", pgData);
      const success = await onSave(pgData);
      
      if (success) {
        console.log("usePGFormSubmit: PG save successful");
        toast({
          title: 'Success',
          description: `PG ${isEdit ? 'updated' : 'created'} successfully!`
        });
        onClose();
        
        if (!isEdit) {
          form.reset({
            name: '',
            type: 'male',
            location: '',
            contactInfo: '',
            totalRooms: 1,
            totalBeds: 1,
            floors: 1,
            managerId: '',
            images: []
          });
        }
      } else {
        console.log("usePGFormSubmit: PG save failed");
        toast({
          title: 'Error',
          description: `Failed to ${isEdit ? 'update' : 'create'} PG. Please check the form and try again.`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error("usePGFormSubmit: Error in form submit:", error);
      
      let errorMessage = `Failed to ${isEdit ? 'update' : 'create'} PG. `;
      
      if (error instanceof Error) {
        if (error.message.includes('foreign key constraint')) {
          errorMessage += 'Selected manager is not available. Please choose a different manager or create the PG without a manager.';
        } else if (error.message.includes('duplicate')) {
          errorMessage += 'A PG with this name already exists. Please choose a different name.';
        } else if (error.message.includes('required')) {
          errorMessage += error.message;
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please check your inputs and try again.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    onSubmit,
    isSubmitting
  };
};
