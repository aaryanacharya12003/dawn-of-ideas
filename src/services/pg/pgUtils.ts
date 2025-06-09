
import { PG } from '@/types';

export const transformPGFromDB = (dbPG: any): PG => {
  try {
    console.log('Transforming PG from DB:', dbPG);
    
    const transformed: PG = {
      id: dbPG.id,
      name: dbPG.name || '',
      type: dbPG.pg_type || 'male', // Use pg_type from database
      location: dbPG.address || dbPG.location || '',
      contactInfo: dbPG.description || '',
      totalRooms: dbPG.total_rooms || 0,
      totalBeds: dbPG.total_rooms || 0, // Default to total_rooms if no separate bed count
      floors: 1, // Default value since not stored in DB
      images: Array.isArray(dbPG.images) ? dbPG.images : [],
      amenities: Array.isArray(dbPG.amenities) ? dbPG.amenities : [],
      roomTypes: [], // Will be populated separately
      revenue: Number(dbPG.revenue) || 0,
      occupancyRate: dbPG.total_rooms > 0 ? 
        Math.round((dbPG.occupied_rooms / dbPG.total_rooms) * 100) : 0,
      monthlyRent: Number(dbPG.monthly_rent) || 0,
      actualOccupancy: dbPG.occupied_rooms || 0,
      totalCapacity: dbPG.total_rooms || 0,
      managerId: dbPG.manager_id || null,
      manager: null // Will be populated if needed
    };

    console.log('Transformed PG:', transformed);
    console.log('PG type after transformation:', transformed.type);
    
    return transformed;
  } catch (error) {
    console.error('Error transforming PG from DB:', error);
    logError('Error in transformPGFromDB:', error);
    
    // Return a minimal valid PG object to prevent crashes
    return {
      id: dbPG.id || '',
      name: dbPG.name || 'Unknown PG',
      type: 'male',
      location: '',
      contactInfo: '',
      totalRooms: 0,
      totalBeds: 0,
      floors: 1,
      images: [],
      amenities: [],
      roomTypes: [],
      revenue: 0,
      occupancyRate: 0,
      monthlyRent: 0,
      actualOccupancy: 0,
      totalCapacity: 0,
      managerId: null,
      manager: null
    };
  }
};

export const logError = (message: string, error: any) => {
  console.error(message, error);
  
  // Log additional error details if available
  if (error?.message) {
    console.error('Error message:', error.message);
  }
  
  if (error?.code) {
    console.error('Error code:', error.code);
  }
  
  if (error?.details) {
    console.error('Error details:', error.details);
  }
};
