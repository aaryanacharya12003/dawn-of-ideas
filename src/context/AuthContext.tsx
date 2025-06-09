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
    role: dbUser.role,
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
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Get user profile from users table
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (userData && !error) {
            setUser(convertDbUserToUser(userData));
          }
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Get user profile from users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (userData && !error) {
          setUser(convertDbUserToUser(userData));
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting login for:', email);

      // First try demo users
      const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (demoUser) {
        console.log('Demo user login successful');
        const { password: _, ...userWithoutPassword } = demoUser;
        setUser(userWithoutPassword as User);
        setIsLoading(false);
        return;
      }

      // Try to find user in our users table first (for users created through the app)
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser && !userCheckError) {
        // User exists in our table, try Supabase authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If email not confirmed, we can still log them in using our users table
          if (error.message.includes('Email not confirmed')) {
            console.log('Email not confirmed, logging in with stored user data');
            setUser(convertDbUserToUser(existingUser));
            
            // Update last login time
            await supabase
              .from('users')
              .update({ lastLogin: new Date().toISOString() })
              .eq('id', existingUser.id);
            
            setIsLoading(false);
            return;
          }
          console.error('Supabase login error:', error);
          throw error;
        }

        if (data.user) {
          console.log('Supabase user login successful:', existingUser);
          setUser(convertDbUserToUser(existingUser));

          // Update last login time
          await supabase
            .from('users')
            .update({ lastLogin: new Date().toISOString() })
            .eq('id', existingUser.id);
        }
      } else {
        // User not found in our users table, throw error
        throw new Error('Invalid email or password');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const createUser = async (email: string, password: string, name: string, role: string, assignedPGs: string[] = []): Promise<void> => {
    try {
      console.log('Creating user:', { email, name, role, assignedPGs });

      // For admin role, don't assign specific PGs as they have access to all
      const finalAssignedPGs = role === 'admin' ? [] : assignedPGs;

      // Create Supabase auth user first, but don't require email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            name,
            role,
            email_confirm: true // Skip email confirmation
          }
        }
      });

      if (authError) {
        console.error('Auth user creation error:', authError);
        throw authError;
      }

      if (authData.user) {
        // Create the user profile in the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            name,
            email,
            role,
            status: 'active',
            lastLogin: 'Never',
            assignedPGs: finalAssignedPGs
          }])
          .select()
          .single();

        if (userError) {
          console.error('User profile creation error:', userError);
          throw userError;
        }

        console.log('User created successfully:', userData);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const updateUser = async (userData: User): Promise<void> => {
    try {
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
        console.error('Error updating user:', error);
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
        console.error('Error deleting user profile:', userError);
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
