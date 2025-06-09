
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Building } from 'lucide-react';

interface NoResultsProps {
  onAddNew: () => void;
}

const NoResults: React.FC<NoResultsProps> = ({ onAddNew }) => {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-muted/40 rounded-full p-4 mb-4">
        <Building className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">No PGs Found</h3>
      <p className="text-sm text-muted-foreground max-w-md mt-2">
        No PGs match your current filters. Try adjusting your search criteria or add a new PG.
      </p>
      <Button className="mt-4" onClick={onAddNew}>
        <Plus className="mr-2 h-4 w-4" /> Add New PG
      </Button>
    </div>
  );
};

export default NoResults;
