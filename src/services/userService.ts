
import { supabase } from '@/integrations/supabase/client';

export interface UserData {
  id?: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  assignedPGs?: string[];
}

export const fetchUsers = async () => {
  try {
    const { data, error } = await (supabase as any)
      .from('users')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    throw error;
  }
};

export const addUser = async (userData: UserData) => {
  try {
    const { data, error } = await (supabase as any)
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.error('Error adding user:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addUser:', error);
    throw error;
  }
};

export const updateUser = async (id: string, userData: Partial<UserData>) => {
  try {
    const { data, error } = await (supabase as any)
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUser:', error);
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    const { error } = await (supabase as any)
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
    const { data: currentUser, error: fetchError } = await (supabase as any)
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

    // Update user with new PG assignment - use pgName instead of pgId
    const { data, error } = await (supabase as any)
      .from('users')
      .update({ assignedPGs: currentPGs })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error assigning PG to user:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in assignPGToUser:', error);
    throw error;
  }
};

export const removePGFromUser = async (userId: string, pgName: string) => {
  try {
    console.log('Removing PG from user:', { userId, pgName });
    
    // Get current user data
    const { data: currentUser, error: fetchError } = await (supabase as any)
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
    const { data, error } = await (supabase as any)
      .from('users')
      .update({ assignedPGs: updatedPGs })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error removing PG from user:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in removePGFromUser:', error);
    throw error;
  }
};
