
import Link from 'next/link';
import { LoginForm } from '@/components/forms';
import { ROUTES } from '@/lib/constants';

/**
 * Login Page
 * Server component - provides layout for LoginForm
 * Architecture: Page routes to form component, keeps logic separate
 */

export default function LoginPage() {
  return (
    <div className="flex-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>

        <LoginForm />

        {/* Sign-up link */}
        <p className="text-center mt-6 text-gray-600">
          Don't have an account?{' '}
          <Link href={ROUTES.REGISTER} className="text-primary font-semibold hover:underline">
            Register here
          </Link>
        </p>

        {/* Removed development-only button */}
      </div>
    </div>
  );
}
