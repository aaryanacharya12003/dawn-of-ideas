
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types';
import { UseFormReturn } from 'react-hook-form';
import { PGFormValues } from './types';
import { useAuth } from '@/context/AuthContext';

interface PGFormManagerSelectProps {
  form: UseFormReturn<PGFormValues>;
  managers: User[];
}

const PGFormManagerSelect: React.FC<PGFormManagerSelectProps> = ({ form, managers: initialManagers }) => {
  const { getUsers, user } = useAuth();
  const [managers, setManagers] = useState<User[]>(initialManagers);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchManagers = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching managers for PG form...');
        const users = await getUsers();
        console.log('Fetched users for manager selection:', users);
        
        // Filter only managers and admins
        const availableManagers = users.filter(u => u.role === 'manager' || u.role === 'admin');
        console.log('Available managers:', availableManagers);
        
        setManagers(availableManagers);
      } catch (error) {
        console.error('Error fetching managers:', error);
        // Fallback to demo users if we're in demo mode
        if (user?.id?.startsWith('demo-')) {
          const demoUsers = JSON.parse(localStorage.getItem('demo-users') || '[]');
          const demoManagers = demoUsers.filter((u: User) => u.role === 'manager' || u.role === 'admin');
          setManagers(demoManagers);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we don't have managers or the list is empty
    if (!initialManagers || initialManagers.length === 0) {
      fetchManagers();
    }
  }, [getUsers, user, initialManagers]);

  return (
    <FormField
      control={form.control}
      name="managerId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assign Manager</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || undefined} disabled={isLoading}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading managers..." : "Select a manager"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {managers.map(manager => (
                <SelectItem key={manager.id} value={manager.id}>
                  {manager.name} ({manager.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PGFormManagerSelect;
