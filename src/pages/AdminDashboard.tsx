
import React from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import RoleDashboard from '@/components/dashboard/RoleDashboard';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    pgs, 
    rooms, 
    students, 
    users,
    isLoading 
  } = useData();

  console.log('AdminDashboard: Current admin user:', user?.email, user?.role);
  console.log('AdminDashboard: Available data - PGs:', pgs.length, 'Rooms:', rooms.length, 'Students:', students.length, 'Users:', users.length);

  // Ensure admin has access to all data
  if (!user || user.role !== 'admin') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-muted-foreground">You need admin privileges to access this dashboard.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading admin data...</span>
        </div>
      </div>
    );
  }

  return <RoleDashboard />;
};

export default AdminDashboard;
