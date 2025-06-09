
// Export all services from a central location to make imports simpler

// Settings
export { 
  type SettingsData,
  fetchSettings,
  updateSettings
} from './settingsService';

// Room Types
export { 
  type RoomTypeData,
  fetchRoomTypes,
  addRoomType,
  updateRoomType,
  deleteRoomType
} from './roomTypesService';

// Users
export { 
  type UserData,
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
  assignPGToUser,
  removePGFromUser
} from './userService';

// PGs - now using the modular structure
export { 
  fetchPGs,
  addPG,
  updatePG,
  deletePG,
  getPGDetails
} from './pg';

// Rooms
export { 
  fetchRooms,
  addRoom,
  updateRoom,
  deleteRoom,
  getRoomStatus
} from './roomService';

// Students
export { 
  searchStudents,
  fetchStudents,
  addStudent,
  removeStudent,
  addPayment,
  getStudentsByRoomId,
  fetchStudentById
} from './studentService';
