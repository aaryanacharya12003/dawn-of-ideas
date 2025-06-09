
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex h-screen overflow-hidden bg-background w-full">
      <div className="flex-1 overflow-auto pl-[70px] md:pl-[280px] transition-all duration-300 w-full">
        <div className="w-full max-w-none p-4 md:p-6 lg:p-8 xl:p-12 min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
