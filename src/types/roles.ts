export enum UserRole {
  SYSTEM_ADMIN = 'system_admin',
  ADMIN = 'admin',
  TECHNICIAN = 'technician'
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.SYSTEM_ADMIN]: 'System Admin',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.TECHNICIAN]: 'Technician'
};

export const UserRoleOptions = Object.entries(UserRoleLabels).map(([value, label]) => ({
  value,
  label
}));

// Helper functions
export const isSystemAdmin = (role: string): boolean => role === UserRole.SYSTEM_ADMIN;
export const isAdmin = (role: string): boolean => role === UserRole.ADMIN;
export const isTechnician = (role: string): boolean => role === UserRole.TECHNICIAN;

export const hasAdminAccess = (role: string): boolean => 
  isSystemAdmin(role) || isAdmin(role);

export const hasSystemAdminAccess = (role: string): boolean => 
  isSystemAdmin(role); 