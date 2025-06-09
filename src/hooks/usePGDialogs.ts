
import { useState } from 'react';
import { PG } from '@/types';

export const usePGDialogs = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPG, setSelectedPG] = useState<PG | null>(null);

  const handleViewPG = (pg: PG) => {
    setSelectedPG(pg);
    setViewDialogOpen(true);
  };

  const handleEditClick = (pg: PG) => {
    setSelectedPG(pg);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (pg: PG) => {
    setSelectedPG(pg);
    setDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    setAddDialogOpen(true);
  };

  return {
    // Dialog states
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
    
    // Handler functions
    handleViewPG,
    handleEditClick,
    handleDeleteClick,
    handleAddNew
  };
};
