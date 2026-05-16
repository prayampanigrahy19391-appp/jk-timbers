import { Role } from '@prisma/client';

/**
 * Defines the role hierarchy. Lower index = higher privileges.
 * A role has all permissions of the roles below it.
 */
const roleHierarchy: Role[] = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.STAFF,
  Role.CONTRACTOR,
  Role.CUSTOMER,
  Role.USER,
];

/**
 * Checks if the user's role has the required permissions.
 * @param userRole The role of the user (from their session token)
 * @param requiredRole The minimum role required to access the resource
 * @returns boolean
 */
export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  const userRank = roleHierarchy.indexOf(userRole);
  const requiredRank = roleHierarchy.indexOf(requiredRole);

  // If either role is invalid (not in hierarchy), deny access
  if (userRank === -1 || requiredRank === -1) {
    return false;
  }

  // User has permission if their rank is equal to or higher (lower index) than required
  return userRank <= requiredRank;
}

/**
 * Utility checks for common access levels
 */
export const isAdmin = (role: Role) => hasPermission(role, Role.ADMIN);
export const isStaff = (role: Role) => hasPermission(role, Role.STAFF);
export const isContractor = (role: Role) => hasPermission(role, Role.CONTRACTOR);
