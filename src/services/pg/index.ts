
// Re-export all PG services for easy imports
export { fetchPGs, getPGDetails } from './pgFetchService';
export { addPG, updatePG } from './pgCreateUpdateService';
export { deletePG } from './pgDeleteService';
export { transformPGFromDB, logError } from './pgUtils';

// Add console logging for debugging
console.log("PG service index loaded successfully");
