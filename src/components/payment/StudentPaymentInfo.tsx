
import React from 'react';
import { Student } from '@/types';
import { formatIndianCurrency } from '@/utils/formatCurrency';
import { useData } from '@/context/DataContext';

interface StudentPaymentInfoProps {
  student: Student;
}

const StudentPaymentInfo: React.FC<StudentPaymentInfoProps> = ({ student }) => {
  const { pgs, rooms } = useData();
  
  // Find the PG and room information
  const studentPG = pgs.find(pg => pg.id === student.pgId);
  const studentRoom = rooms.find(room => room.id === student.roomId);
  
  return (
    <div className="bg-muted p-3 rounded text-sm space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <span className="font-medium">PG:</span> {studentPG?.name || "Not assigned"}
        </div>
        <div>
          <span className="font-medium">Room:</span> {studentRoom?.number || "Not assigned"}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <span className="font-medium">Total Fees:</span> {formatIndianCurrency(student.totalFees)}
        </div>
        <div>
          <span className="font-medium">Security Deposit:</span> {formatIndianCurrency(student.deposit)}
        </div>
      </div>
      <div>
        <span className="font-medium">Paid Amount:</span> 
        {formatIndianCurrency(student.payments.reduce((sum, p) => sum + p.amount, 0))}
      </div>
    </div>
  );
};

export default StudentPaymentInfo;
