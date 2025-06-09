
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboardIcon, UsersIcon, CreditCardIcon, BarChart2Icon, SettingsIcon, LogOutIcon, BuildingIcon, DoorOpenIcon, UserIcon, DatabaseIcon, MenuIcon, ChevronLeftIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
const AppSidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const {
    user,
    logout
  } = useAuth();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [pathname, isMobile]);

  // Define menu items for the sidebar
  const menuItems = [{
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboardIcon,
    description: 'Overview of key metrics',
    roles: ['admin', 'manager', 'accountant', 'viewer']
  }, {
    name: 'Students',
    href: '/students',
    icon: UsersIcon,
    description: 'Manage student records',
    roles: ['admin', 'manager']
  }, {
    name: 'PG Management',
    href: '/pg-management',
    icon: BuildingIcon,
    description: 'Manage PG properties',
    roles: ['admin']
  }, {
    name: 'Room Management',
    href: '/room-management',
    icon: DoorOpenIcon,
    description: 'Track rooms and occupancy',
    roles: ['admin', 'manager']
  }, {
    name: 'Payments',
    href: '/payments',
    icon: CreditCardIcon,
    description: 'Track financial transactions',
    roles: ['admin', 'manager', 'accountant']
  }, {
    name: 'Reports',
    href: '/reports',
    icon: BarChart2Icon,
    description: 'Analytics and reporting',
    roles: ['admin']
  }, {
    name: 'Users',
    href: '/users',
    icon: UserIcon,
    description: 'User account management',
    roles: ['admin']
  }, {
    name: 'Settings',
    href: '/settings',
    icon: SettingsIcon,
    description: 'System configuration',
    roles: ['admin']
  }, {
    name: 'Backup & Logs',
    href: '/backup-logs',
    icon: DatabaseIcon,
    description: 'Data backup and system logs',
    roles: ['admin']
  }];

  // Filter menu items based on user role with better debugging
  const filteredMenuItems = menuItems.filter(item => {
    console.log(`Checking menu item: ${item.name}, user role: ${user?.role}, allowed roles:`, item.roles);
    return user?.role && item.roles.includes(user.role);
  });
  console.log('Filtered menu items for user:', filteredMenuItems.map(item => item.name));

  // Handle menu item click on mobile to close sidebar
  const handleMenuItemClick = () => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  };
  return <aside className={cn("h-screen fixed left-0 top-0 z-40 bg-sidebar flex flex-col transition-all duration-300 ease-in-out", isCollapsed ? "w-[70px]" : "w-[280px]")}>
      <div className="flex justify-between items-center h-16 px-3">
        {!isCollapsed ? <div className="flex items-center justify-center">
            <img src="https://restayindia.com/wp-content/uploads/2024/12/Screenshot-2024-12-23-163218-Edited-1.png" alt="Restay Logo" className="h-10 object-contain" />
          </div> : <div className="w-full flex justify-center">
            <img alt="Restay Logo" className="h-8 w-8 object-cover" src="/lovable-uploads/6d16a901-933b-4031-a176-fe846af5da1a.png" />
          </div>}
        
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="text-white hover:bg-white/10">
          {isCollapsed ? <MenuIcon size={20} /> : <ChevronLeftIcon size={20} />}
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {filteredMenuItems.map(item => <li key={item.name}>
              <Link to={item.href} className={cn("flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10 transition-colors", pathname === item.href && "bg-white/20", isCollapsed && "justify-center px-2")} title={isCollapsed ? item.name : ''} onClick={handleMenuItemClick}>
                <item.icon size={20} />
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            </li>)}
        </ul>
      </div>
      
      <div className="p-3 border-t border-white/10">
        {user && <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
            <div className="h-8 w-8 rounded-full bg-[#00A2F3] border-2 border-white flex items-center justify-center text-white">
              <span className="text-xs font-medium">
                {user.name?.split(' ').map(n => n[0]).join('') || 'A'}
              </span>
            </div>
            {!isCollapsed && <div className="flex-1">
                <p className="text-sm font-medium truncate text-white">{user.name || 'Admin User'}</p>
                <p className="text-xs truncate text-zinc-50">{user.email || 'admin@restay.com'}</p>
                <p className="text-xs text-zinc-400 capitalize">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-[#00A2F3]/10 text-[#00A2F3]' : user.role === 'manager' ? 'bg-amber-500/10 text-amber-500' : user.role === 'accountant' ? 'bg-green-500/10 text-green-500' : user.role === 'viewer' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {user.role || 'admin'}
                  </span>
                </p>
              </div>}
            <Button variant="ghost" size="icon" onClick={logout} className={cn("h-8 w-8 text-white hover:bg-white/10", isCollapsed && "ml-0")} title="Logout">
              <LogOutIcon className="h-4 w-4" />
            </Button>
          </div>}
      </div>
    </aside>;
};
export default AppSidebar;
