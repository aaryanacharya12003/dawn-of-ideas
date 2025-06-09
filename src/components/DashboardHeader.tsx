
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

interface DashboardHeaderProps {
  pgId?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ pgId }) => {
  const { rooms, students, pgs } = useData();
  const { user } = useAuth();
  
  console.log('DashboardHeader: Rendering with user role:', user?.role);
  console.log('DashboardHeader: pgId filter (raw):', pgId);
  console.log('DashboardHeader: Available data - Students:', students.length, 'Rooms:', rooms.length, 'PGs:', pgs.length);
  
  // Filter data based on pgId if provided and valid
  let filteredStudents = students;
  let filteredRooms = rooms;
  
  // Apply PG filter if provided and not 'all'
  if (pgId && pgId !== 'all' && typeof pgId === 'string') {
    filteredStudents = students.filter(student => student.pgId === pgId);
    filteredRooms = rooms.filter(room => room.pgId === pgId);
    console.log('DashboardHeader: Applied PG filter for pgId:', pgId);
    console.log('DashboardHeader: Filtered results - Students:', filteredStudents.length, 'Rooms:', filteredRooms.length);
  } else {
    console.log('DashboardHeader: No PG filter applied, showing all data');
  }
  
  // Calculate statistics
  const totalRooms = filteredRooms.length;
  const totalCapacity = filteredRooms.reduce((sum, room) => sum + room.capacity, 0);
  const totalOccupancy = filteredStudents.length;
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  console.log('DashboardHeader: Room stats - Total:', totalRooms, 'Capacity:', totalCapacity, 'Occupancy:', totalOccupancy, 'Rate:', occupancyRate);

  // Calculate payment revenue from students with proper filtering
  const allPayments = filteredStudents.flatMap(student => {
    const payments = student.payments || [];
    console.log(`DashboardHeader: Student ${student.name} has ${payments.length} payments`);
    return payments;
  });
  
  console.log('DashboardHeader: Total payments found:', allPayments.length);
  
  const verifiedPayments = allPayments.filter(payment => payment.approvalStatus === 'approved');
  const pendingPayments = allPayments.filter(payment => payment.approvalStatus === 'pending' || !payment.approvalStatus);
  
  const totalRevenue = verifiedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingRevenue = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  console.log('DashboardHeader: Payment stats - Verified:', verifiedPayments.length, 'Amount:', totalRevenue, 'Pending:', pendingPayments.length, 'Amount:', pendingRevenue);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col space-y-1 md:space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Total Rooms</p>
            <p className="text-2xl md:text-3xl font-bold">{totalRooms}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col space-y-1 md:space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Current Occupancy</p>
            <p className="text-2xl md:text-3xl font-bold">{totalOccupancy} / {totalCapacity}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col space-y-1 md:space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
            <p className="text-2xl md:text-3xl font-bold">{occupancyRate}%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col space-y-1 md:space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {user?.role === 'accountant' ? 'Verified Revenue' : 'Total Revenue'}
            </p>
            <p className="text-2xl md:text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
            {user?.role === 'accountant' && pendingRevenue > 0 && (
              <p className="text-xs text-orange-600">
                ₹{pendingRevenue.toLocaleString()} pending
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHeader;
