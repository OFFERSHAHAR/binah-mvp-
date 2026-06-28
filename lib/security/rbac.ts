/**
 * Role-Based Access Control (RBAC) system
 */

export type UserRole = 'student' | 'teacher' | 'admin'

export interface Permission {
  resource: string
  action: string // 'read', 'create', 'update', 'delete'
}

export interface RolePermissions {
  role: UserRole
  permissions: Set<string>
}

// Define permissions for each role
const rolePermissionsMap: Record<UserRole, Set<string>> = {
  student: new Set([
    'dashboard:read',
    'profile:read',
    'assignments:read',
    'grades:read',
    'lessons:read',
    'messages:read',
    'messages:create',
    'resources:read',
  ]),
  teacher: new Set([
    'dashboard:read',
    'dashboard:update',
    'profile:read',
    'profile:update',
    'assignments:read',
    'assignments:create',
    'assignments:update',
    'assignments:delete',
    'grades:read',
    'grades:create',
    'grades:update',
    'lessons:read',
    'lessons:create',
    'lessons:update',
    'lessons:delete',
    'messages:read',
    'messages:create',
    'resources:read',
    'resources:create',
    'resources:update',
    'resources:delete',
  ]),
  admin: new Set([
    // Admin has all permissions
    'dashboard:read',
    'dashboard:update',
    'profile:read',
    'profile:update',
    'assignments:read',
    'assignments:create',
    'assignments:update',
    'assignments:delete',
    'grades:read',
    'grades:create',
    'grades:update',
    'grades:delete',
    'lessons:read',
    'lessons:create',
    'lessons:update',
    'lessons:delete',
    'messages:read',
    'messages:create',
    'messages:update',
    'messages:delete',
    'resources:read',
    'resources:create',
    'resources:update',
    'resources:delete',
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    'settings:read',
    'settings:update',
    'audit:read',
    'security:manage',
  ]),
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, resource: string, action: string): boolean {
  const permission = `${resource}:${action}`
  const permissions = rolePermissionsMap[role]

  return permissions ? permissions.has(permission) : false
}

/**
 * Check if a role has all specified permissions
 */
export function hasAllPermissions(
  role: UserRole,
  permissions: Array<{ resource: string; action: string }>
): boolean {
  return permissions.every(({ resource, action }) => hasPermission(role, resource, action))
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
  role: UserRole,
  permissions: Array<{ resource: string; action: string }>
): boolean {
  return permissions.some(({ resource, action }) => hasPermission(role, resource, action))
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole): string[] {
  const permissions = rolePermissionsMap[role]
  return permissions ? Array.from(permissions) : []
}

/**
 * Check if a user can access a resource
 */
export function canAccessResource(
  userRole: UserRole,
  resource: string,
  targetUserId?: string,
  currentUserId?: string
): boolean {
  // Admin can access everything
  if (userRole === 'admin') {
    return true
  }

  // Students can only access their own data (except shared resources)
  if (userRole === 'student' && targetUserId && currentUserId && targetUserId !== currentUserId) {
    // Allow access to shared resources
    if (resource === 'lessons' || resource === 'resources') {
      return hasPermission(userRole, resource, 'read')
    }
    return false
  }

  return hasPermission(userRole, resource, 'read')
}

/**
 * Check if a user can perform an action on a resource
 */
export function canPerformAction(
  userRole: UserRole,
  resource: string,
  action: string,
  targetUserId?: string,
  currentUserId?: string
): boolean {
  // Check basic permission
  if (!hasPermission(userRole, resource, action)) {
    return false
  }

  // Additional checks for sensitive operations
  if (action === 'delete' && targetUserId && currentUserId && targetUserId === currentUserId) {
    // Users cannot delete their own account (admin-only)
    return userRole === 'admin'
  }

  return true
}

/**
 * Get role hierarchy level
 */
export function getRoleLevel(role: UserRole): number {
  const hierarchy: Record<UserRole, number> = {
    student: 1,
    teacher: 2,
    admin: 3,
  }
  return hierarchy[role]
}

/**
 * Check if a role has higher or equal privilege than another
 */
export function hasHigherOrEqualPrivilege(role1: UserRole, role2: UserRole): boolean {
  return getRoleLevel(role1) >= getRoleLevel(role2)
}

/**
 * Get permissions by resource
 */
export function getPermissionsByResource(role: UserRole, resource: string): string[] {
  const permissions = rolePermissionsMap[role]

  if (!permissions) {
    return []
  }

  const filtered = Array.from(permissions).filter((p) => p.startsWith(`${resource}:`))

  return filtered.map((p) => p.split(':')[1])
}

/**
 * Validate permission format
 */
export function isValidPermission(permission: string): boolean {
  const [resource, action] = permission.split(':')
  return !!(resource && action && (action === 'read' || action === 'create' || action === 'update' || action === 'delete'))
}

/**
 * Get all unique resources
 */
export function getAllResources(): string[] {
  const resources = new Set<string>()

  Object.values(rolePermissionsMap).forEach((permissions) => {
    permissions.forEach((p) => {
      const resource = p.split(':')[0]
      resources.add(resource)
    })
  })

  return Array.from(resources).sort()
}

/**
 * Generate permission matrix for display
 */
export function generatePermissionMatrix(): Record<
  UserRole,
  Record<string, Record<string, boolean>>
> {
  const matrix: Record<UserRole, Record<string, Record<string, boolean>>> = {
    student: {},
    teacher: {},
    admin: {},
  }

  const resources = getAllResources()
  const actions = ['read', 'create', 'update', 'delete']

  Object.entries(rolePermissionsMap).forEach(([role, permissions]) => {
    resources.forEach((resource) => {
      matrix[role as UserRole][resource] = {}
      actions.forEach((action) => {
        matrix[role as UserRole][resource][action] = permissions.has(`${resource}:${action}`)
      })
    })
  })

  return matrix
}
