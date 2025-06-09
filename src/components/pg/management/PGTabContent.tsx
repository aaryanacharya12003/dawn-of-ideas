
import React from 'react';
import { PG } from '@/types';
import PGCards from './PGCards';
import NoResults from './NoResults';

interface PGTabContentProps {
  loading: boolean;
  filteredPGs: PG[];
  onView: (pg: PG) => void;
  onEdit: (pg: PG) => void;
  onDelete: (pg: PG) => void;
  onAddNew: () => void;
  showDeleteButton?: boolean;
}

const PGTabContent: React.FC<PGTabContentProps> = ({
  loading,
  filteredPGs,
  onView,
  onEdit,
  onDelete,
  onAddNew,
  showDeleteButton = true
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p>Loading PGs...</p>
      </div>
    );
  }

  if (filteredPGs.length === 0) {
    return <NoResults onAddNew={onAddNew} />;
  }

  return (
    <PGCards
      pgs={filteredPGs}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      showDeleteButton={showDeleteButton}
    />
  );
};

export default PGTabContent;
