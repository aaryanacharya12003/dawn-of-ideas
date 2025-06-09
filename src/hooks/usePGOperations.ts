
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PG } from '@/types';
import { addPG as addPGService, updatePG as updatePGService, deletePG as deletePGService } from '@/services/pg';

export const usePGOperations = (refreshAllData?: () => Promise<void>) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleAddPG = async (pg: Omit<PG, 'id'>): Promise<boolean> => {
    if (isProcessing) {
      console.log("PGOperations: Already processing, skipping duplicate request");
      return false;
    }

    try {
      setIsProcessing(true);
      console.log("PGOperations: Submitting new PG:", pg);
      
      // Validate required fields with better error messages
      if (!pg.name?.trim()) {
        toast({
          title: 'Validation Error',
          description: 'PG name is required',
          variant: 'destructive'
        });
        return false;
      }
      
      if (!pg.location?.trim()) {
        toast({
          title: 'Validation Error', 
          description: 'Location is required',
          variant: 'destructive'
        });
        return false;
      }
      
      if (!pg.totalRooms || pg.totalRooms < 1) {
        toast({
          title: 'Validation Error',
          description: 'Total rooms must be at least 1',
          variant: 'destructive'
        });
        return false;
      }

      if (!pg.floors || pg.floors < 1) {
        toast({
          title: 'Validation Error', 
          description: 'Number of floors must be at least 1',
          variant: 'destructive'
        });
        return false;
      }

      // Create the PG
      console.log("PGOperations: Creating PG with data:", {
        name: pg.name,
        location: pg.location,
        totalRooms: pg.totalRooms,
        floors: pg.floors,
        type: pg.type
      });

      const newPG = await addPGService(pg);
      console.log("PGOperations: PG created successfully:", newPG);
      
      // Refresh data after successful creation
      if (refreshAllData) {
        console.log("PGOperations: Refreshing all data after PG creation...");
        await refreshAllData();
      }
      
      toast({
        title: 'Success',
        description: `${pg.name} has been created successfully with ${pg.totalRooms} rooms across ${pg.floors} floors.`
      });
      
      return true;
      
    } catch (error) {
      console.error('Error adding PG in PGOperations:', error);
      
      let errorMessage = 'Failed to create PG. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('foreign key constraint')) {
          errorMessage = 'Selected manager is not available. Please choose a different manager or create the PG without a manager.';
        } else if (error.message.includes('failed to create rooms')) {
          errorMessage = `${pg.name} was created but some rooms could not be generated. You can add rooms manually from the Room Management page.`;
        } else if (error.message.includes('required')) {
          errorMessage = error.message;
        } else if (error.message.includes('duplicate')) {
          errorMessage = 'A PG with this name already exists. Please choose a different name.';
        } else {
          errorMessage = `Failed to create PG: ${error.message}`;
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditPG = async (pg: PG): Promise<boolean> => {
    if (isProcessing) {
      console.log("PGOperations: Already processing, skipping duplicate request");
      return false;
    }

    try {
      setIsProcessing(true);
      console.log("PGOperations: Updating PG:", pg);
      
      const updatedPG = await updatePGService(pg.id, pg);
      console.log("PGOperations: PG updated successfully:", updatedPG);
      
      // Refresh data after successful update
      if (refreshAllData) {
        console.log("PGOperations: Refreshing all data after PG update...");
        await refreshAllData();
      }
      
      toast({
        title: 'Success',
        description: `${pg.name} has been updated successfully.`
      });
      
      return true;
    } catch (error) {
      console.error('Error updating PG in PGOperations:', error);
      
      let errorMessage = 'Failed to update PG. Please try again.';
      if (error instanceof Error && error.message.includes('foreign key constraint')) {
        errorMessage = 'Selected manager is not available. Please choose a different manager.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePG = async (pgId?: string, pgName?: string): Promise<boolean> => {
    if (!pgId) return false;
    
    if (isProcessing) {
      console.log("PGOperations: Already processing, skipping duplicate request");
      return false;
    }
    
    try {
      setIsProcessing(true);
      console.log("PGOperations: Deleting PG:", pgId);
      
      await deletePGService(pgId);
      console.log("PGOperations: PG deleted successfully");
      
      // Refresh data after successful deletion
      if (refreshAllData) {
        console.log("PGOperations: Refreshing all data after PG deletion...");
        await refreshAllData();
      }
      
      toast({
        title: 'Success',
        description: `${pgName || 'PG'} and all its rooms have been deleted successfully.`
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting PG in PGOperations:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete PG. Please try again.',
        variant: 'destructive'
      });
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleAddPG,
    handleEditPG,
    handleDeletePG
  };
};
