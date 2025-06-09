
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { User, RoomType } from '@/types';
import { PGFormValues } from '@/components/pg/types';
import { FloorAllocation } from '@/components/pg/PGFormRoomAllocation';
import PGFormBasicInfo from '@/components/pg/PGFormBasicInfo';
import PGFormManagerSelect from '@/components/pg/PGFormManagerSelect';
import PGFormRoomTypes from '@/components/pg/PGFormRoomTypes';
import PGFormRoomAllocation from '@/components/pg/PGFormRoomAllocation';
import PGFormImageGallery from '@/components/pg/PGFormImageGallery';

interface PGFormContentProps {
  form: UseFormReturn<PGFormValues>;
  managers: User[];
  roomTypes: RoomType[];
  setRoomTypes: React.Dispatch<React.SetStateAction<RoomType[]>>;
  roomAllocations: FloorAllocation[];
  setRoomAllocations: React.Dispatch<React.SetStateAction<FloorAllocation[]>>;
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  isEdit: boolean;
  pgId?: string;
}

const PGFormContent: React.FC<PGFormContentProps> = ({
  form,
  managers,
  roomTypes,
  setRoomTypes,
  roomAllocations,
  setRoomAllocations,
  images,
  setImages,
  isEdit,
  pgId
}) => {
  return (
    <>
      {/* Basic PG Information */}
      <PGFormBasicInfo form={form} />
      
      {/* Manager Selection */}
      <PGFormManagerSelect form={form} managers={managers} />
      
      {/* Room Types Section */}
      <PGFormRoomTypes 
        roomTypes={roomTypes} 
        setRoomTypes={setRoomTypes} 
        pgId={pgId}
      />
      
      {/* Room Allocation Section - Only show for new PGs */}
      {!isEdit && (
        <PGFormRoomAllocation
          roomTypes={roomTypes}
          floors={form.watch('floors')}
          totalRooms={form.watch('totalRooms')}
          allocations={roomAllocations}
          setAllocations={setRoomAllocations}
        />
      )}
      
      {/* Images Gallery */}
      <PGFormImageGallery images={images} setImages={setImages} />
    </>
  );
};

export default PGFormContent;
