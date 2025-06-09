
import { supabase } from '@/integrations/supabase/client';
import { PG, Room } from '@/types';

/**
 * Returns the count of rooms for a specific PG
 */
export const getRoomCountForPG = async (pgId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .eq('pg_id', pgId);
    
    if (error) {
      console.error("Error counting rooms for PG:", error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error("Error in getRoomCountForPG:", error);
    return 0;
  }
};

/**
 * Returns occupancy statistics for rooms in a PG
 */
export const getPGRoomStats = async (pgId: string): Promise<{
  total: number;
  vacant: number;
  partial: number;
  full: number;
  maintenance: number;
}> => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('status')
      .eq('pg_id', pgId);
    
    if (error) {
      console.error("Error getting room stats for PG:", error);
      return { total: 0, vacant: 0, partial: 0, full: 0, maintenance: 0 };
    }
    
    const total = data.length;
    const vacant = data.filter(room => room.status === 'vacant').length;
    const partial = data.filter(room => room.status === 'partial').length;
    const full = data.filter(room => room.status === 'full').length;
    const maintenance = data.filter(room => room.status === 'maintenance').length;
    
    return { total, vacant, partial, full, maintenance };
  } catch (error) {
    console.error("Error in getPGRoomStats:", error);
    return { total: 0, vacant: 0, partial: 0, full: 0, maintenance: 0 };
  }
};

/**
 * Updates the PG record with current room statistics
 */
export const updatePGRoomStatistics = async (pg: PG): Promise<void> => {
  try {
    // Get current room stats
    const stats = await getPGRoomStats(pg.id);
    
    // Calculate occupancy rate
    const occupancyRate = stats.total > 0 
      ? Math.round(((stats.partial + stats.full) / stats.total) * 100) 
      : 0;
    
    // Update PG record with new stats
    await supabase
      .from('pgs')
      .update({ 
        total_rooms: stats.total,
        occupancy_rate: occupancyRate 
      })
      .eq('id', pg.id);
    
  } catch (error) {
    console.error("Error updating PG room statistics:", error);
  }
};
