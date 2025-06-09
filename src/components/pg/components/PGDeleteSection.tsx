
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { PG } from '@/types';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import DeletePGDialog from '@/components/pg/management/DeletePGDialog';

interface PGDeleteSectionProps {
  pg: PG;
  onDelete?: (pgId: string) => Promise<boolean>;
  onClose: () => void;
  isSubmitting: boolean;
}

const PGDeleteSection: React.FC<PGDeleteSectionProps> = ({
  pg,
  onDelete,
  onClose,
  isSubmitting
}) => {
  const { toast } = useToast();
  const { refreshAllData } = useData();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete(pg.id);
      await refreshAllData();
      setDeleteDialogOpen(false);
      onClose();
      toast({
        title: 'Success',
        description: `${pg.name} and all its rooms have been deleted successfully.`
      });
    } catch (error) {
      console.error('Error deleting PG:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete PG. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!onDelete) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => setDeleteDialogOpen(true)}
        disabled={isSubmitting || isDeleting}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete PG
      </Button>

      <DeletePGDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        pgName={pg.name}
        onDelete={handleDelete}
        loading={isDeleting}
      />
    </>
  );
};

export default PGDeleteSection;
