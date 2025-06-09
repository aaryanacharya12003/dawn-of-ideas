
import React from 'react';
import AppSidebar from './AppSidebar';
import UserMenu from './UserMenu';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-[70px] md:ml-[280px] w-full">
        <div className="h-16 border-b flex items-center justify-between px-4 md:px-6 w-full">
          <div className="md:hidden"></div>
          <UserMenu />
        </div>
        <div className="flex-1 overflow-y-auto w-full">
          <div className="w-full max-w-none p-4 md:p-6 lg:p-8 xl:p-12 min-h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
