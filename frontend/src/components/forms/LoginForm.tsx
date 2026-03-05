'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { VALIDATION, ROUTES } from '@/lib/constants';
import { supabase } from '@/lib/supabase/client';

/**
 * LoginForm Component
 * Uses Supabase Auth for login
 * Redirects based on role
 */

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validation
      if (!VALIDATION.EMAIL_REGEX.test(email)) {
        setError('Invalid email format');
        return;
      }
      if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
        setError(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`);
        return;
      }

      // Supabase sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      const user = data?.user;
      if (!user) {
        setError('No user session returned');
        return;
      }

      // determine role using auth helper (reads profiles table)
      import('@/lib/auth').then(async ({ getUserRole }) => {
        const role = await getUserRole(user.id);
        if (role === 'admin') router.push('/admin');
        else if (role === 'finance') router.push('/finance');
        else if (role === 'production') router.push('/production');
        else router.push(ROUTES.DASHBOARD);
      }).catch((err) => {
        console.warn('Failed to fetch role:', err);
        router.push(ROUTES.DASHBOARD);
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        trailing={
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="text-sm text-gray-600 hover:text-gray-900"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        }
      />

      <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
        Sign In
      </Button>
    </form>
  );
}