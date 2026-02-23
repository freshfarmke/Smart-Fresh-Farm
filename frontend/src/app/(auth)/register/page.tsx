import Link from 'next/link';
import { RegisterForm } from '@/components/forms';
import { ROUTES } from '@/lib/constants';

/**
 * Register Page
 * Server component - provides layout for RegisterForm
 * Architecture: Page routes to form component, keeps logic separate
 */

export default function RegisterPage() {
  return (
    <div className="flex-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>

        <RegisterForm />

        {/* Sign-in link */}
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link href={ROUTES.LOGIN} className="text-primary font-semibold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
