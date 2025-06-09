
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { PG } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Import our refactored components
import PGPageHeader from '@/components/pg/management/PGPageHeader';
import PGFilters from '@/components/pg/management/PGFilters';
import PGTabContent from '@/components/pg/management/PGTabContent';
import PGDialogManager from '@/components/pg/management/PGDialogManager';

// Import custom hooks
import { usePGDialogs } from '@/hooks/usePGDialogs';

const PGManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use DataContext as the single source of truth
  const { 
    pgs: pgData, 
    isLoading: loading,
    refreshAllData,
    addPG,
    updatePG,
    deletePG
  } = useData();

  // Use custom hooks for dialog management
  const {
    addDialogOpen,
    setAddDialogOpen,
    editDialogOpen,
    setEditDialogOpen,
    viewDialogOpen,
    setViewDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedPG,
    setSelectedPG,
    handleViewPG,
    handleEditClick,
    handleDeleteClick,
    handleAddNew
  } = usePGDialogs();

  // Load data when component mounts or user changes
  useEffect(() => {
    if (user && user.id) {
      console.log("PGManagement: User authenticated, ensuring data is loaded for user:", user?.email, user?.role);
      refreshAllData();
    }
  }, [user?.id, user?.role, refreshAllData]);

  // Enhanced handlers that integrate with dialog management
  const onAddPG = async (pg: Omit<PG, 'id'>): Promise<boolean> => {
    if (isProcessing) {
      console.log("PGManagement: Already processing, skipping");
      return false;
    }

    try {
      setIsProcessing(true);
      console.log("PGManagement: onAddPG called with:", pg);
      
      // Validate required fields
      if (!pg.name?.trim()) {
        toast({
          title: 'Validation Error',
          description: 'PG name is required.',
          variant: 'destructive'
        });
        return false;
      }

      if (!pg.location?.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Location is required.',
          variant: 'destructive'
        });
        return false;
      }

      const newPG = await addPG(pg);
      console.log("PGManagement: PG created successfully:", newPG);
      
      setAddDialogOpen(false);
      
      toast({
        title: 'Success',
        description: `${pg.name} has been created successfully with ${pg.totalRooms} rooms.`
      });
      
      return true;
      
    } catch (error) {
      console.error("PGManagement: Error in onAddPG:", error);
      
      let errorMessage = 'Failed to create PG. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
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

  const onEditPG = async (pg: PG): Promise<boolean> => {
    if (isProcessing) {
      console.log("PGManagement: Already processing, skipping");
      return false;
    }

    try {
      setIsProcessing(true);
      console.log("PGManagement: onEditPG called with:", pg);
      
      await updatePG(pg);
      console.log("PGManagement: PG updated successfully");
      
      setEditDialogOpen(false);
      setSelectedPG(null);
      
      return true;
      
    } catch (error) {
      console.error("PGManagement: Error in onEditPG:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const onDeletePG = async (pgId?: string): Promise<boolean> => {
    const targetPgId = pgId || selectedPG?.id;
    const targetPg = pgId ? pgData.find(pg => pg.id === pgId) : selectedPG;
    
    if (!targetPgId || !targetPg) return false;
    
    if (isProcessing) {
      console.log("PGManagement: Already processing, skipping");
      return false;
    }
    
    try {
      setIsProcessing(true);
      console.log("PGManagement: onDeletePG called for:", targetPg.name);
      
      await deletePG(targetPgId);
      console.log("PGManagement: PG deleted successfully");
      
      setDeleteDialogOpen(false);
      setSelectedPG(null);
      
      return true;
      
    } catch (error) {
      console.error("PGManagement: Error in onDeletePG:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter PGs based on tab selection and search query
  const filteredPGs = pgData.filter(pg => {
    // Filter by tab
    if (activeTab !== "all" && pg.type !== activeTab) return false;
    
    // Filter by search
    if (searchQuery && !pg.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !pg.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  console.log("PGManagement: Rendering with", pgData.length, "total PGs,", filteredPGs.length, "filtered PGs");

  return (
    <div className="page-container space-y-6">
      <PGPageHeader 
        onAddNew={handleAddNew}
        isProcessing={isProcessing}
        loading={loading}
      />
      
      {/* Filters */}
      <div className="space-y-4">
        <div className="responsive-flex justify-between">
          <PGFilters 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
      
      {/* PG Content */}
      <div className="mt-6">
        <PGTabContent 
          loading={loading || isProcessing}
          filteredPGs={filteredPGs}
          onView={handleViewPG}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onAddNew={handleAddNew}
          showDeleteButton={true}
        />
      </div>

      {/* All Dialogs */}
      <PGDialogManager
        addDialogOpen={addDialogOpen}
        setAddDialogOpen={setAddDialogOpen}
        editDialogOpen={editDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        viewDialogOpen={viewDialogOpen}
        setViewDialogOpen={setViewDialogOpen}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        selectedPG={selectedPG}
        setSelectedPG={setSelectedPG}
        onAddPG={onAddPG}
        onEditPG={onEditPG}
        onDeletePG={onDeletePG}
        onEditClick={handleEditClick}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default PGManagement;
