/**
 * Centralized RBAC validation for API routes
 * 
 * All secure API endpoints should use requireFinanceRole or requireAdminRole
 * to ensure consistent, safe role validation and user extraction
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { AuthUser } from '@/types/database';

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Get authenticated user from request context
 * Returns AuthUser with guaranteed id and email
 * Throws UnauthorizedError if not authenticated
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
            } catch {
              // Handle cookie setting errors silently
            }
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
 * Get user profile with role from Supabase
 * Returns role: 'admin' | 'finance' | 'production'
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
            } catch {
              // Handle cookie setting errors silently
            }
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
      // Default to 'finance' if role not found
      return 'finance';
    }

    return data.role || 'finance';
  } catch (error) {
    if (error instanceof ForbiddenError) throw error;
    console.error('Error getting user role:', error);
    throw new ForbiddenError('Failed to retrieve user role');
  }
}

/**
 * REQUIRED: Use this in all finance API routes
 * Validates user is authenticated and has 'finance' or 'admin' role
 * Returns the authenticated AuthUser
 * Throws UnauthorizedError or ForbiddenError
 */
export async function requireFinanceRole(): Promise<AuthUser> {
  const user = await getServerUser();
  const role = await getUserRole(user.id);

  if (role !== 'finance' && role !== 'admin') {
    throw new ForbiddenError(
      `User role '${role}' does not have finance access. Required: finance or admin.`
    );
  }

  return user;
}

/**
 * OPTIONAL: Use for admin-only endpoints
 * Validates user is authenticated and has 'admin' role
 * Returns the authenticated AuthUser
 * Throws UnauthorizedError or ForbiddenError
 */
export async function requireAdminRole(): Promise<AuthUser> {
  const user = await getServerUser();
  const role = await getUserRole(user.id);

  if (role !== 'admin') {
    throw new ForbiddenError(
      `User role '${role}' does not have admin access. Required: admin.`
    );
  }

  return user;
}

/**
 * Format error responses for API routes
 */
export function formatErrorResponse(
  error: unknown
): { success: boolean; error: { message: string; details?: string } } {
  if (error instanceof UnauthorizedError) {
    return {
      success: false,
      error: {
        message: 'Unauthorized',
        details: error.message,
      },
    };
  }

  if (error instanceof ForbiddenError) {
    return {
      success: false,
      error: {
        message: 'Forbidden',
        details: error.message,
      },
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        message: 'Internal Server Error',
        details: error.message,
      },
    };
  }

  return {
    success: false,
    error: {
      message: 'Unknown Error',
    },
  };
}
