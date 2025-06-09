
import React from 'react';

interface RoomProgressBarProps {
  occupancy: number;
  capacity: number;
}

const RoomProgressBar: React.FC<RoomProgressBarProps> = ({ occupancy, capacity }) => {
  const percentage = (occupancy / capacity) * 100;
  
  const getProgressColor = () => {
    if (occupancy === 0) return 'bg-gray-200';
    if (occupancy === capacity) return 'bg-status-full';
    return 'bg-status-half';
  };

  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full ${getProgressColor()}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default RoomProgressBar;
