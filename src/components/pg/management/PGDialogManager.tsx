
import React from 'react';
import AddEditPGDialog from '@/components/AddEditPGDialog';
import PGViewDialog from '@/components/pg/management/PGViewDialog';
import DeletePGDialog from '@/components/pg/management/DeletePGDialog';
import { PG } from '@/types';

interface PGDialogManagerProps {
  // Add dialog states
  addDialogOpen: boolean;
  setAddDialogOpen: (open: boolean) => void;
  editDialogOpen: boolean;
  setEditDialogOpen: (open: boolean) => void;
  viewDialogOpen: boolean;
  setViewDialogOpen: (open: boolean) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  
  // Selected PG
  selectedPG: PG | null;
  setSelectedPG: (pg: PG | null) => void;
  
  // Handler functions - updated to return Promise<boolean>
  onAddPG: (pg: Omit<PG, 'id'>) => Promise<boolean>;
  onEditPG: (pg: PG) => Promise<boolean>;
  onDeletePG: (pgId?: string) => Promise<boolean>;
  onEditClick: (pg: PG) => void;
  
  // Loading state
  isProcessing: boolean;
}

const PGDialogManager: React.FC<PGDialogManagerProps> = ({
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
  onAddPG,
  onEditPG,
  onDeletePG,
  onEditClick,
  isProcessing
}) => {
  return (
    <>
      {/* Add PG Dialog */}
      <AddEditPGDialog
        isOpen={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={onAddPG}
      />
      
      {/* Edit PG Dialog */}
      {selectedPG && (
        <AddEditPGDialog
          isOpen={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedPG(null);
          }}
          onSave={onEditPG}
          onDelete={onDeletePG}
          pg={selectedPG}
        />
      )}
      
      {/* View PG Dialog */}
      {selectedPG && (
        <PGViewDialog
          selectedPG={selectedPG}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          onEdit={(pg) => {
            setViewDialogOpen(false);
            onEditClick(pg);
          }}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <DeletePGDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setSelectedPG(null);
        }}
        pgName={selectedPG?.name || ''}
        onDelete={() => onDeletePG()}
        loading={isProcessing}
      />
    </>
  );
};

export default PGDialogManager;
