
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { DataContextType } from './types/DataContextTypes';
import { useDataLoader } from './hooks/useDataLoader';
import { usePGOperations } from './hooks/usePGOperations';
import { useRoomOperations } from './hooks/useRoomOperations';
import { useStudentOperations } from './hooks/useStudentOperations';
import { usePaymentOperations } from './hooks/usePaymentOperations';
import { getRoomStatus } from './utils/dataTransformUtils';

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === null) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user } = useAuth();

  console.log("DataContext: Current user:", user?.email, user?.role, user?.assignedPGs);
  console.log("DataContext: Unified data connection for role:", user?.role);

  // Use the unified data loader hook
  const {
    pgs,
    rooms,
    students,
    users,
    isLoading,
    loadAllData,
    refreshAllData,
    setPgs,
    setRooms,
    setStudents,
    setUsers
  } = useDataLoader(user);

  // Use unified operation hooks with proper refresh callbacks
  const pgOperations = usePGOperations(refreshAllData);
  const roomOperations = useRoomOperations(refreshAllData);
  const studentOperations = useStudentOperations(user, students, refreshAllData, loadAllData);
  const paymentOperations = usePaymentOperations(user, refreshAllData);

  // Load data when user changes - with proper dependency handling
  useEffect(() => {
    if (user && user.id) {
      console.log("DataContext: User authenticated, loading unified data for:", user.email, user.role);
      loadAllData();
    } else {
      console.log("DataContext: No authenticated user, clearing all data");
      setPgs([]);
      setRooms([]);
      setStudents([]);
      setUsers([]);
    }
  }, [user?.id, user?.role]);

  // Create the context value
  const value: DataContextType = {
    pgs,
    rooms,
    students,
    users,
    isLoading,
    ...pgOperations,
    ...roomOperations,
    ...studentOperations,
    ...paymentOperations,
    getRoomStatus,
    refreshAllData
  };

  console.log("DataContext: Providing unified data - PGs:", pgs.length, "Rooms:", rooms.length, "Students:", students.length, "Users:", users.length);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
