
import { supabase } from '@/integrations/supabase/client';

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'accountant' | 'viewer';
  status: string;
  assignedPGs: string[];
  lastLogin: string;
  created_at?: string;
  updated_at?: string;
}

// Helper function to convert database user to UserData type
const convertDbUserToUserData = (dbUser: any): UserData => {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role as 'admin' | 'manager' | 'accountant' | 'viewer',
    status: dbUser.status || 'active',
    lastLogin: dbUser.lastLogin || 'Never',
    assignedPGs: Array.isArray(dbUser.assignedPGs) ? dbUser.assignedPGs : [],
    created_at: dbUser.created_at,
    updated_at: dbUser.updated_at
  };
};

export const fetchUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    const convertedUsers = (data || []).map(convertDbUserToUserData);
    return convertedUsers;
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    throw error;
  }
};

export const addUser = async (userData: Omit<UserData, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        assignedPGs: userData.assignedPGs,
        lastLogin: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding user:', error);
      throw error;
    }

    return convertDbUserToUserData(data);
  } catch (error) {
    console.error('Error in addUser:', error);
    throw error;
  }
};

export const updateUser = async (id: string, userData: Partial<UserData>) => {
  try {
    const updateData: any = {};
    
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.role !== undefined) updateData.role = userData.role;
    if (userData.status !== undefined) updateData.status = userData.status;
    if (userData.assignedPGs !== undefined) updateData.assignedPGs = userData.assignedPGs;
    if (userData.lastLogin !== undefined) updateData.lastLogin = userData.lastLogin;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    return convertDbUserToUserData(data);
  } catch (error) {
    console.error('Error in updateUser:', error);
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteUser:', error);
    throw error;
  }
};

export const assignPGToUser = async (userId: string, pgName: string) => {
  try {
    console.log('Assigning PG to user:', { userId, pgName });
    
    // Get current user data
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('assignedPGs')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user for PG assignment:', fetchError);
      throw fetchError;
    }

    // Get current assigned PGs and add new one if not already present
    const currentPGs = Array.isArray(currentUser.assignedPGs) ? currentUser.assignedPGs : [];
    if (!currentPGs.includes(pgName)) {
      currentPGs.push(pgName);
    }

    // Update user with new PG assignment
    const { data, error } = await supabase
      .from('users')
      .update({ assignedPGs: currentPGs })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error assigning PG to user:', error);
      throw error;
    }

    return convertDbUserToUserData(data);
  } catch (error) {
    console.error('Error in assignPGToUser:', error);
    throw error;
  }
};

export const removePGFromUser = async (userId: string, pgName: string) => {
  try {
    console.log('Removing PG from user:', { userId, pgName });
    
    // Get current user data
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('assignedPGs')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user for PG removal:', fetchError);
      throw fetchError;
    }

    // Get current assigned PGs and remove the specified one
    const currentPGs = Array.isArray(currentUser.assignedPGs) ? currentUser.assignedPGs : [];
    const updatedPGs = currentPGs.filter((pg: string) => pg !== pgName);

    // Update user with removed PG assignment
    const { data, error } = await supabase
      .from('users')
      .update({ assignedPGs: updatedPGs })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error removing PG from user:', error);
      throw error;
    }

    return convertDbUserToUserData(data);
  } catch (error) {
    console.error('Error in removePGFromUser:', error);
    throw error;
  }
};
