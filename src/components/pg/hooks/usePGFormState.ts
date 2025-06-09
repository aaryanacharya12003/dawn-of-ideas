
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PG, RoomType, User } from '@/types';
import { fetchUsers } from '@/services/dataService';
import { useToast } from '@/hooks/use-toast';
import { pgFormSchema, PGFormValues } from '@/components/pg/types';
import { FloorAllocation } from '@/components/pg/PGFormRoomAllocation';

export const usePGFormState = (pg?: PG, isOpen?: boolean) => {
  const { toast } = useToast();
  const [managers, setManagers] = useState<User[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomAllocations, setRoomAllocations] = useState<FloorAllocation[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [originalRoomTypes, setOriginalRoomTypes] = useState<RoomType[]>([]);
  const [formKey, setFormKey] = useState(0);
  
  const isEdit = Boolean(pg);
  
  const form = useForm<PGFormValues>({
    resolver: zodResolver(pgFormSchema),
    defaultValues: {
      name: '',
      type: 'male',
      location: '',
      contactInfo: '',
      totalRooms: 1,
      totalBeds: 1,
      floors: 1,
      managerId: '',
      images: []
    }
  });

  // Load managers when component mounts or pg changes
  useEffect(() => {
    const loadManagers = async () => {
      try {
        console.log("usePGFormState: Fetching managers...");
        const users = await fetchUsers();
        console.log("usePGFormState: Fetched users:", users);
        const availableManagers = users.filter(user => user.role === 'manager' && user.status === 'active');
        setManagers(availableManagers);
        console.log("usePGFormState: Available managers:", availableManagers);
      } catch (error) {
        console.error('Error loading managers:', error);
        setManagers([]);
        toast({
          title: 'Warning',
          description: 'Could not load managers. You can create the PG without assigning a manager.',
          variant: 'destructive'
        });
      }
    };
    
    if (isOpen) {
      loadManagers();
      
      if (pg) {
        setRoomTypes(pg.roomTypes || []);
        setOriginalRoomTypes(pg.roomTypes || []);
        setImages(pg.images || []);
        setRoomAllocations([]);
      } else {
        setRoomTypes([]);
        setOriginalRoomTypes([]);
        setImages([]);
        setRoomAllocations([]);
      }
    }
  }, [pg, isOpen, toast]);
  
  // Reset form when dialog opens/closes with improved synchronization
  useEffect(() => {
    if (isOpen) {
      if (pg) {
        console.log("usePGFormState: Setting form values for edit:", pg);
        console.log("usePGFormState: Current PG type:", pg.type);
        
        // Prepare form values with proper type casting
        const formValues: PGFormValues = {
          name: pg.name || '',
          type: (pg.type as 'male' | 'female' | 'unisex') || 'male',
          location: pg.location || '',
          contactInfo: pg.contactInfo || '',
          totalRooms: pg.totalRooms || 1,
          totalBeds: pg.totalBeds || 1,
          floors: pg.floors || 1,
          managerId: pg.managerId || '',
          images: pg.images || []
        };
        
        console.log("usePGFormState: Setting form values:", formValues);
        console.log("usePGFormState: Type value being set:", formValues.type);
        
        // Reset form with the values immediately
        form.reset(formValues);
        
        // Force update the form key to trigger re-render
        setFormKey(prev => prev + 1);
        
        // Additional verification after a brief delay
        setTimeout(() => {
          const currentValues = form.getValues();
          console.log("usePGFormState: Form values after reset:", currentValues);
          console.log("usePGFormState: Type field current value:", currentValues.type);
          
          // If type field is not set correctly, force set it
          if (currentValues.type !== formValues.type) {
            console.log("usePGFormState: Type mismatch detected, forcing update");
            form.setValue('type', formValues.type, { shouldValidate: true, shouldDirty: false });
          }
        }, 50);
        
        setRoomTypes(pg.roomTypes || []);
        setOriginalRoomTypes(pg.roomTypes || []);
        setImages(pg.images || []);
        setRoomAllocations([]);
      } else {
        console.log("usePGFormState: Resetting form for new PG");
        const defaultValues: PGFormValues = {
          name: '',
          type: 'male',
          location: '',
          contactInfo: '',
          totalRooms: 1,
          totalBeds: 1,
          floors: 1,
          managerId: '',
          images: []
        };
        
        form.reset(defaultValues);
        setRoomTypes([]);
        setOriginalRoomTypes([]);
        setImages([]);
        setRoomAllocations([]);
        setFormKey(prev => prev + 1);
      }
    }
  }, [isOpen, pg, form]);

  return {
    form,
    formKey,
    managers,
    roomTypes,
    setRoomTypes,
    roomAllocations,
    setRoomAllocations,
    images,
    setImages,
    originalRoomTypes,
    setOriginalRoomTypes,
    isEdit
  };
};
