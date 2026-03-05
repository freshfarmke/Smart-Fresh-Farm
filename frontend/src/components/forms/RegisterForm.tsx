'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { VALIDATION, ROUTES } from '@/lib/constants';
import { supabase } from '@/lib/supabase/client';

/**
 * RegisterForm Component
 * Uses Supabase Auth for signup
 * Mirrors Display Name in Auth and name in profiles table
 */

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Client-side validation
      if (!name.trim()) {
        setError('Name is required');
        return;
      }
      if (!VALIDATION.EMAIL_REGEX.test(email)) {
        setError('Invalid email format');
        return;
      }
      if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
        setError(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Sign up with Supabase, set display_name
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name, // mirrors front-end Full Name
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const user = data?.user;
      if (!user) {
        setError('Registration succeeded but no user was returned.');
        return;
      }

      // Insert a profile record (stored in `profiles` table)
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id, // references auth.user.id
          email,
          name, // mirrors Display Name
          role: 'production', // default role for new staff registrations
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return;
      }

      // Redirect after successful registration
      setTimeout(() => router.push(ROUTES.DASHBOARD), 800);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
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
        label="Full Name"
        type="text"
        placeholder="John Doe"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

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
        helperText={`Minimum ${VALIDATION.PASSWORD_MIN_LENGTH} characters`}
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

      <Input
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        placeholder="••••••••"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        trailing={
          <button
            type="button"
            onClick={() => setShowConfirmPassword((s) => !s)}
            className="text-sm text-gray-600 hover:text-gray-900"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? 'Hide' : 'Show'}
          </button>
        }
      />

      <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
        Create Account
      </Button>
    </form>
  );
}