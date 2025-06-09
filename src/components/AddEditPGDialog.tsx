
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { PG } from '@/types';
import { usePGFormState } from '@/components/pg/hooks/usePGFormState';
import { usePGFormSubmit } from '@/components/pg/hooks/usePGFormSubmit';
import { usePGFormValidation } from '@/components/pg/hooks/usePGFormValidation';
import PGFormContent from '@/components/pg/components/PGFormContent';
import PGDeleteSection from '@/components/pg/components/PGDeleteSection';

interface AddEditPGDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pg: Omit<PG, 'id'> | PG) => Promise<boolean>;
  onDelete?: (pgId: string) => Promise<boolean>;
  pg?: PG;
}

const AddEditPGDialog: React.FC<AddEditPGDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  pg 
}) => {
  const {
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
  } = usePGFormState(pg, isOpen);

  const { onSubmit, isSubmitting } = usePGFormSubmit({
    form,
    managers,
    roomTypes,
    roomAllocations,
    images,
    originalRoomTypes,
    isEdit,
    pg,
    onSave,
    onClose
  });

  usePGFormValidation({
    form,
    roomAllocations,
    setRoomAllocations
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="responsive-flex justify-between items-center">
            <DialogTitle>{isEdit ? 'Edit PG' : 'Add New PG'}</DialogTitle>
            {isEdit && pg && (
              <PGDeleteSection
                pg={pg}
                onDelete={onDelete}
                onClose={onClose}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="responsive-form pt-4" key={formKey}>
            <PGFormContent
              form={form}
              managers={managers}
              roomTypes={roomTypes}
              setRoomTypes={setRoomTypes}
              roomAllocations={roomAllocations}
              setRoomAllocations={setRoomAllocations}
              images={images}
              setImages={setImages}
              isEdit={isEdit}
              pgId={pg?.id}
            />
            
            <DialogFooter className="pt-4 responsive-button-group">
              <Button 
                variant="outline" 
                type="button" 
                onClick={onClose} 
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-24"
              >
                {isSubmitting ? 'Creating...' : isEdit ? 'Update' : 'Create'} PG
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditPGDialog;
