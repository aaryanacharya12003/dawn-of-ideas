
import { supabase } from '@/integrations/supabase/client';
import { transformPGFromDB, logError } from './pgUtils';
import { PG } from '@/types';

export const fetchPGs = async (): Promise<PG[]> => {
  try {
    console.log('PG Service: Fetching PGs from database...');
    
    const { data, error } = await supabase
      .from('pgs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('PG Service: Error fetching PGs:', error);
      logError('Error fetching PGs:', error);
      throw error;
    }

    console.log('PG Service: Raw PG data from database:', data);

    if (!data || data.length === 0) {
      console.log('PG Service: No PGs found in database');
      return [];
    }

    // Transform database data to our PG type
    const transformedPGs: PG[] = data.map(transformPGFromDB);

    console.log('PG Service: Transformed PGs:', transformedPGs.length, transformedPGs.map(pg => ({ id: pg.id, name: pg.name })));
    return transformedPGs;

  } catch (error) {
    console.error('PG Service: Error in fetchPGs:', error);
    logError('Error in fetchPGs:', error);
    throw error;
  }
};

export const getPGDetails = async (pgId: string): Promise<PG | null> => {
  try {
    console.log('PG Service: Fetching PG details for ID:', pgId);
    
    const { data, error } = await supabase
      .from('pgs')
      .select('*')
      .eq('id', pgId)
      .single();

    if (error) {
      console.error('PG Service: Error fetching PG details:', error);
      logError('Error fetching PG details:', error);
      throw error;
    }

    if (!data) {
      console.log('PG Service: No PG found with ID:', pgId);
      return null;
    }

    // Transform database data to our PG type
    const pg = transformPGFromDB(data);

    console.log('PG Service: PG details fetched:', pg);
    return pg;

  } catch (error) {
    console.error('PG Service: Error in getPGDetails:', error);
    logError('Error in getPGDetails:', error);
    return null;
  }
};
