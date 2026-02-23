/**
 * Authentication and authorization helpers
 * 
 * Architecture:
 * - Role-based access control (RBAC)
 * - User profile caching
 * - Permission checking utilities
 * 
 * Roles:
 * - admin: Full access to all features
 * - production: Create batches, dispatch products, record returns
 * - finance: Record expenses, view profits, approve collections
 */

import { supabase } from './supabase/client';
import type { UserProfile, AuthUser } from '@/types/database';

/**
 * Get current user session from Supabase Auth
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get user profile with role information
 * Requires user to be authenticated
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Check if user has specific role
 */
export async function hasRole(
  userId: string,
  requiredRole: 'admin' | 'production' | 'finance'
): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile) return false;

  // Admin has all permissions
  if (profile.role === 'admin') return true;

  return profile.role === requiredRole;
}

/**
 * Check if user can perform production tasks
 * Allowed: admin, production roles
 */
export async function canProduceOrDispatch(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile) return false;

  return profile.role === 'admin' || profile.role === 'production';
}

/**
 * Check if user can perform finance tasks
 * Allowed: admin, finance roles
 */
export async function canManageFinance(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  if (!profile) return false;

  return profile.role === 'admin' || profile.role === 'finance';
}

/**
 * Get user's role name
 */
export async function getUserRole(userId: string): Promise<string | null> {
  const profile = await getUserProfile(userId);
  return profile?.role || null;
}

/**
 * Sign out user
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * TODO: Implement Google OAuth integration
 * - Sign in with Google provider
 * - Auto-create profile on first sign-in
 * - Handle role assignment
 * 
 * Example:
 * ```typescript
 * export async function signInWithGoogle() {
 *   const { data, error } = await supabase.auth.signInWithOAuth({
 *     provider: 'google',
 *     options: {
 *       redirectTo: `${window.location.origin}/auth/callback`,
 *     },
 *   });
 * }
 * ```
 */

/**
 * TODO: Implement subscription management
 * - Check subscription status
 * - Handle subscription renewal
 * - Enforce feature limits based on plan
 * 
 * This will be needed when monetizing the platform
 */
