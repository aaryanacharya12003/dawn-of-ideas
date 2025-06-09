
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { Toaster } from '@/components/ui/sonner';
import AuthGuard from '@/components/AuthGuard';
import AppLayout from '@/components/AppLayout';
import LoginPage from '@/pages/LoginPage';
import Index from '@/pages/Index';
import StudentsPage from '@/pages/StudentsPage';
import AddStudentPage from '@/pages/AddStudentPage';
import PaymentsPage from '@/pages/PaymentsPage';
import ReportsPage from '@/pages/ReportsPage';
import SettingsPage from '@/pages/SettingsPage';
import UsersPage from '@/pages/UsersPage';
import PGManagementPage from '@/pages/PGManagement';
import RoomManagement from '@/pages/RoomManagement';
import BackupLogsPage from '@/pages/BackupLogsPage';
import AdminDashboard from '@/pages/AdminDashboard';
import ManagerDashboard from '@/pages/ManagerDashboard';
import AccountantDashboard from '@/pages/AccountantDashboard';
import ProfilePage from '@/pages/ProfilePage';
import NotFound from '@/pages/NotFound';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <DataProvider>
            <div className="min-h-screen bg-background w-full">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={
                  <AuthGuard>
                    <AppLayout>
                      <Index />
                    </AppLayout>
                  </AuthGuard>
                } />
                <Route path="/profile" element={
                  <AuthGuard>
                    <AppLayout>
                      <ProfilePage />
                    </AppLayout>
                  </AuthGuard>
                } />
                <Route path="/dashboard/admin" element={
                  <AuthGuard requiredRole="admin">
                    <AppLayout>
                      <AdminDashboard />
                    </AppLayout>
                  </AuthGuard>
                } />
                <Route path="/dashboard/manager" element={
                  <AuthGuard requiredRole="manager">
                    <AppLayout>
                      <ManagerDashboard />
                    </AppLayout>
                  </AuthGuard>
                } />
                <Route path="/dashboard/accountant" element={
                  <AuthGuard requiredRole="accountant">
                    <AppLayout>
                      <AccountantDashboard />
                    </AppLayout>
                  </AuthGuard>
                } />
                <Route path="/students" element={
                  <AuthGuard>
                    <AppLayout>
                      <StudentsPage />
                    </AppLayout>
                  </AuthGuard>
                } />
                <Route path="/students/add" element={
                  <AuthGuard>
                    <AppLayout>
                      <AddStudentPage />
                    </AppLayout>
                  </AuthGuard>
                } />
                <Route path="/add-student" element={
                  <AuthGuard>
                    <AppLayout>
                      <AddStudentPage />
                    </AppLayout>
                  </AuthGuard>
                } />
                <Route path="/edit-student/:id" element={
                  <AuthGuard>
                    <AppLayout>
                      <AddStudentPage />
                    </AppLayout>
                  </AuthGuard>
                } />
                <Route path="/payments" element={
                  <AuthGuard>
                    <AppLayout>
                      <PaymentsPage />
                    </AppLayout>
                  </AuthGuard>
                } />
                <Route path="/reports" element={
                  <AuthGuard>
                    <AppLayout>
                      <ReportsPage />
                    </AppLayout>
                  </AuthGuard>
                } />
                <Route path="/settings" element={
                  <AuthGuard>
                    <AppLayout>
                      <SettingsPage />
                    </AppLayout>
                  </AuthGuard>
                } />
                <Route path="/users" element={
                  <AuthGuard requiredRole="admin">
                    <AppLayout>
                      <UsersPage />
                    </AppLayout>
                  </AuthGuard>
                } />
                <Route path="/pg-management" element={
                  <AuthGuard>
                    <AppLayout>
                      <PGManagementPage />
                    </AppLayout>
                  </AuthGuard>
                } />
                <Route path="/room-management" element={
                  <AuthGuard>
                    <AppLayout>
                      <RoomManagement />
                    </AppLayout>
                  </AuthGuard>
                } />
                <Route path="/backup-logs" element={
                  <AuthGuard requiredRole="admin">
                    <AppLayout>
                      <BackupLogsPage />
                    </AppLayout>
                  </AuthGuard>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </DataProvider>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
