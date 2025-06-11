
import { PG } from '@/types';
import { addPG as addPGService, updatePG as updatePGService, deletePG as deletePGService } from '@/services/pg';
import { useToast } from '@/hooks/use-toast';

export const usePGOperations = (refreshAllData: () => Promise<void>) => {
  const { toast } = useToast();

  const handleAddPG = async (pg: Omit<PG, 'id'>): Promise<PG> => {
    try {
      console.log("DataContext PGOps: Adding PG:", pg.name);
      
      // Basic validation
      if (!pg.name?.trim()) {
        toast({
          title: 'Validation Error',
          description: 'PG name is required',
          variant: 'destructive'
        });
        throw new Error('PG name is required');
      }
      
      if (!pg.location?.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Location is required',
          variant: 'destructive'
        });
        throw new Error('Location is required');
      }
      
      const newPG = await addPGService(pg);
      console.log("DataContext PGOps: PG added successfully:", newPG);
      
      // Refresh all data after successful creation
      await refreshAllData();
      
      toast({
        title: 'Success',
        description: `${pg.name} has been created successfully with ${pg.totalRooms} rooms.`
      });
      
      return newPG;
    } catch (error) {
      console.error("DataContext PGOps: Error adding PG:", error);
      
      let errorMessage = `Failed to create ${pg.name}. Please try again.`;
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication required')) {
          errorMessage = 'Please log in to create PGs.';
        } else if (error.message.includes('foreign key constraint')) {
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
      throw error;
    }
  };

  const handleUpdatePG = async (pg: PG): Promise<PG> => {
    try {
      console.log("DataContext PGOps: Updating PG:", pg.name);
      const updatedPG = await updatePGService(pg.id, pg);
      console.log("DataContext PGOps: PG updated successfully:", updatedPG);
      
      // Refresh all data after successful update
      await refreshAllData();
      
      toast({
        title: 'Success',
        description: `${pg.name} has been updated successfully.`
      });
      
      return updatedPG;
    } catch (error) {
      console.error("DataContext PGOps: Error updating PG:", error);
      toast({
        title: 'Error',
        description: `Failed to update ${pg.name}. Please try again.`,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const handleDeletePG = async (pgId: string) => {
    try {
      console.log("DataContext PGOps: Deleting PG:", pgId);
      await deletePGService(pgId);
      console.log("DataContext PGOps: PG deleted successfully");
      
      // Refresh all data after successful deletion
      await refreshAllData();
      
      toast({
        title: 'Success',
        description: 'PG and all its rooms have been deleted successfully.'
      });
    } catch (error) {
      console.error("DataContext PGOps: Error deleting PG:", error);
      toast({
        title: 'Error',
        description: 'Failed to delete PG. Please try again.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  return {
    addPG: handleAddPG,
    updatePG: handleUpdatePG,
    deletePG: handleDeletePG
  };
};
