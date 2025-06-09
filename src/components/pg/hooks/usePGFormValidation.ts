
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { PGFormValues } from '@/components/pg/types';
import { FloorAllocation } from '@/components/pg/PGFormRoomAllocation';

interface UsePGFormValidationProps {
  form: UseFormReturn<PGFormValues>;
  roomAllocations: FloorAllocation[];
  setRoomAllocations: React.Dispatch<React.SetStateAction<FloorAllocation[]>>;
}

export const usePGFormValidation = ({
  form,
  roomAllocations,
  setRoomAllocations
}: UsePGFormValidationProps) => {
  const totalRooms = form.watch('totalRooms');
  const floors = form.watch('floors');

  useEffect(() => {
    const totalAllocated = roomAllocations.reduce((sum, allocation) => sum + allocation.count, 0);
    if (totalAllocated > totalRooms) {
      setRoomAllocations([]);
    }
  }, [totalRooms, floors, roomAllocations, setRoomAllocations]);
};
