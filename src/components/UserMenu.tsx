import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
const UserMenu: React.FC = () => {
  const {
    user,
    logout
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const handleLogout = async () => {
    // Show toast immediately
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });

    // Logout is now instant
    await logout();
  };
  const handleProfileClick = () => {
    navigate('/profile');
  };
  if (!user) return null;
  return <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
          <div className="h-8 w-8 rounded-full bg-restay flex items-center justify-center text-white">
            <span className="text-xs font-medium">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleProfileClick}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
          <LogOutIcon className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>;
};
export default UserMenu;