
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeletePGDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pgName: string;
  onDelete: () => void;
  loading: boolean;
}

const DeletePGDialog: React.FC<DeletePGDialogProps> = ({
  open,
  onOpenChange,
  pgName,
  onDelete,
  loading
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete PG</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{pgName}"? This will also delete all associated rooms and data. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onDelete} 
            className="bg-destructive hover:bg-destructive/90"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete PG'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePGDialog;
