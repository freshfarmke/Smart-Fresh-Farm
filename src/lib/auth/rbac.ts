/**
 * Centralized Role-Based Access Control (RBAC) helpers
 * All API routes and secure functions must use these helpers
 *
 * Supported roles: admin, production, finance, dispatch, viewer
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { AuthUser } from '@/types/database';

export class UnauthorizedError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Get authenticated user from request context
 */
export async function getServerUser(): Promise<AuthUser> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email || !user.id) {
      throw new UnauthorizedError('User not authenticated or email missing');
    }

    return {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    console.error('Error getting server user:', error);
    throw new UnauthorizedError('Failed to authenticate user');
  }
}

/**
 * Get user role from profiles table
 */
async function getUserRole(userId: string): Promise<string> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('Error fetching user role:', error);
      // Default to viewer for security
      return 'viewer';
    }

    return data.role || 'viewer';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'viewer';
  }
}

/**
 * Require authentication - returns authenticated user
 */
export async function requireAuth(): Promise<AuthUser> {
  return await getServerUser();
}

/**
 * Require specific role - returns authenticated user
 */
export async function requireRole(requiredRole: string): Promise<AuthUser> {
  const user = await getServerUser();
  const role = await getUserRole(user.id);

  if (role !== requiredRole) {
    throw new ForbiddenError(
      `User role '${role}' does not have access. Required: ${requiredRole}.`
    );
  }

  return user;
}

/**
 * Require any of the specified roles - returns authenticated user
 */
export async function requireAnyRole(requiredRoles: string[]): Promise<AuthUser> {
  const user = await getServerUser();
  const role = await getUserRole(user.id);

  if (!requiredRoles.includes(role)) {
    throw new ForbiddenError(
      `User role '${role}' does not have access. Required: ${requiredRoles.join(' or ')}.`
    );
  }

  return user;
}

/**
 * Check if user has specific role (for conditional logic)
 */
export async function hasRole(userId: string, role: string): Promise<boolean> {
  const userRole = await getUserRole(userId);
  return userRole === role;
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(userId: string, roles: string[]): Promise<boolean> {
  const userRole = await getUserRole(userId);
  return roles.includes(userRole);
}

/**
 * Format error response for API routes
 */
export function formatErrorResponse(error: unknown): { message: string; code?: string } {
  if (error instanceof UnauthorizedError) {
    return { message: error.message, code: 'UNAUTHORIZED' };
  }
  if (error instanceof ForbiddenError) {
    return { message: error.message, code: 'FORBIDDEN' };
  }
  if (error instanceof Error) {
    return { message: error.message, code: 'ERROR' };
  }
  return { message: 'An unknown error occurred', code: 'UNKNOWN' };
}