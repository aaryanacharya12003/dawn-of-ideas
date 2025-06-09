
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PGPageHeaderProps {
  onAddNew: () => void;
  isProcessing: boolean;
  loading: boolean;
}

const PGPageHeader: React.FC<PGPageHeaderProps> = ({
  onAddNew,
  isProcessing,
  loading
}) => {
  return (
    <div className="responsive-flex justify-between items-start sm:items-center">
      <h1 className="text-2xl font-bold">PG Management</h1>
      <Button 
        onClick={onAddNew}
        disabled={isProcessing || loading}
        className="w-full sm:w-auto"
      >
        <Plus className="mr-2 h-4 w-4" /> Add New PG
      </Button>
    </div>
  );
};

export default PGPageHeader;
