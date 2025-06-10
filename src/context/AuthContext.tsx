import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { ensureStringArray } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  createUser: (email: string, password: string, name: string, role: string, assignedPGs?: string[]) => Promise<void>;
  updateUser: (userData: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  getUsers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Demo users for fallback authentication
const DEMO_USERS = [
  {
    id: 'demo-admin-1',
    name: 'Admin User',
    email: 'admin@restay.com',
    role: 'admin',
    password: 'password',
    status: 'active',
    lastLogin: new Date().toISOString(),
    assignedPGs: []
  },
  {
    id: 'demo-manager-1', 
    name: 'Manager User',
    email: 'manager@restay.com',
    role: 'manager',
    password: 'password',
    status: 'active',
    lastLogin: new Date().toISOString(),
    assignedPGs: ['Sunrise PG', 'Comfort Lodge']
  },
  {
    id: 'demo-accountant-1',
    name: 'Accountant User',
    email: 'accountant@restay.com',
    role: 'accountant',
    password: 'password',
    status: 'active',
    lastLogin: new Date().toISOString(),
    assignedPGs: []
  }
];

// Helper function to convert database user to User type
const convertDbUserToUser = (dbUser: any): User => {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role as any,
    status: dbUser.status || 'active',
    lastLogin: dbUser.lastLogin || 'Never',
    assignedPGs: ensureStringArray(dbUser.assignedPGs)
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      try {
        console.log('AuthContext: Checking for existing user session...');
        
        // Check localStorage first for demo users or stored auth
        const storedUser = localStorage.getItem('demo-user');
        if (storedUser) {
          console.log('AuthContext: Found stored demo user');
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('AuthContext: Found Supabase session');
          // Try to get user profile from users table first
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (userData && !userError) {
            console.log('AuthContext: Found user in users table:', userData);
            setUser(convertDbUserToUser(userData));
          }
        }
      } catch (error) {
        console.error('AuthContext: Error checking user session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state changed:', event);
      if (event === 'SIGNED_IN' && session?.user) {
        // Get user profile from database
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (userData && !userError) {
          setUser(convertDbUserToUser(userData));
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('demo-user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Attempting login for:', email);

      // First try demo users
      const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (demoUser) {
        console.log('AuthContext: Demo user login successful');
        const { password: _, ...userWithoutPassword } = demoUser;
        const demoUserData = userWithoutPassword as User;
        setUser(demoUserData);
        localStorage.setItem('demo-user', JSON.stringify(demoUserData));
        setIsLoading(false);
        return;
      }

      // Try to find user in our users table first
      console.log('AuthContext: Checking users table for:', email);
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      console.log('AuthContext: Database user lookup result:', { existingUser, userCheckError });

      if (existingUser && !userCheckError) {
        // For database users, we'll use a simple password check
        // In a real app, you'd want proper password hashing
        const defaultPassword = 'password'; // Default password for all database users
        
        if (password === defaultPassword) {
          console.log('AuthContext: Database user login successful:', existingUser);
          const userData = convertDbUserToUser(existingUser);
          setUser(userData);
          
          // Store as demo user to persist session
          localStorage.setItem('demo-user', JSON.stringify(userData));
          
          // Update last login time
          await supabase
            .from('users')
            .update({ lastLogin: new Date().toISOString() })
            .eq('id', existingUser.id);
          
          setIsLoading(false);
          return;
        } else {
          throw new Error('Invalid password');
        }
      }

      // If no user found in database, try Supabase auth
      console.log('AuthContext: Trying Supabase authentication');
      const { data: authUser, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('AuthContext: Supabase login error:', authError);
        throw new Error('Invalid email or password');
      }

      if (authUser.user) {
        // This would be for users created through Supabase auth
        throw new Error('User profile not found in database');
      }
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Logging out user');
      localStorage.removeItem('demo-user');
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
    }
  };

  const createUser = async (email: string, password: string, name: string, role: string, assignedPGs: string[] = []): Promise<void> => {
    try {
      console.log('Creating user:', { email, name, role, assignedPGs });

      // For admin role, don't assign specific PGs as they have access to all
      const finalAssignedPGs = role === 'admin' ? [] : assignedPGs;

      // Create Supabase auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            name,
            role,
            email_confirm: true
          }
        }
      });

      if (authError) {
        console.error('Auth user creation error:', authError);
        throw authError;
      }

      if (authData.user) {
        // Create the user profile in users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            name,
            email,
            role,
            status: 'active',
            lastLogin: new Date().toISOString(),
            assignedPGs: finalAssignedPGs
          }])
          .select()
          .single();

        if (userError) {
          console.error('User profile creation error in users table:', userError);
          throw userError;
        }

        console.log('User created successfully in database');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const updateUser = async (userData: User): Promise<void> => {
    try {
      // Update in users table
      const { data, error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          status: userData.status,
          assignedPGs: userData.assignedPGs
        })
        .eq('id', userData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user in users table:', error);
        throw error;
      }

      // Update current user if it's the same user
      if (user && user.id === userData.id) {
        setUser(convertDbUserToUser(data));
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      // Delete from users table
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (userError) {
        console.error('Error deleting user profile from users table:', userError);
        throw userError;
      }

      console.log('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const getUsers = async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      console.log('Fetched users from database:', data);
      const convertedUsers = (data || []).map(convertDbUserToUser);
      return convertedUsers;
    } catch (error) {
      console.error('Error in getUsers:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    getUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
