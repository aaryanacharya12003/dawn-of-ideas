
import { supabase } from '@/integrations/supabase/client';
import { logError } from './pgUtils';

export const deletePG = async (id: string) => {
  console.log('Deleting PG with id:', id);
  
  try {
    const { error } = await (supabase as any)
      .from('pgs')
      .delete()
      .eq('id', id);

    if (error) {
      logError('Error deleting PG:', error);
      throw error;
    }

    console.log('PG deleted successfully with id:', id);
    return true;
  } catch (error) {
    logError('Error in deletePG service:', error);
    throw error;
  }
};
