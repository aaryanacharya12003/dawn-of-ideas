
import React from 'react';
import { cn } from '@/lib/utils';
import { RoomStatus, PaymentStatus } from '@/types';

interface StatusBadgeProps {
  status: RoomStatus | PaymentStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'vacant':
      case 'Paid':
        return 'bg-green-500 text-white';
      case 'partial':
      case 'Partial':
        return 'bg-amber-500 text-white';
      case 'full':
      case 'maintenance':
      case 'Unpaid':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <span 
      className={cn(
        'px-2 py-1 rounded-full text-xs font-semibold',
        getStatusColor(),
        className
      )}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
